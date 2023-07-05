import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { CategoryService } from "src/app/core/services/category.service";
import { combineLatest, filter, map, take } from "rxjs";
import { Category } from "src/app/shared/models/category.model";
import { ArtistService } from "src/app/core/services/artist.service";
import { Artist } from "src/app/shared/models/artist.model";
import { Album } from "src/app/shared/models/album.model";
import { AlbumService } from "src/app/core/services/album.service";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { ActivatedRoute, Router } from "@angular/router";

interface Data {
  [normalizedName: string]: {
    name: string;
    type: string;
    level: number;
    expanded?: boolean;
    selected?: boolean;
    children?: Data;
    data?: Category | Artist | Album;
  };
}

export class FlatNode {
  constructor(
    public name: string,
    public level = 1,
    public data?: Album | Artist,
    public expanded = false,
    public expandable = false,
    public selected = false
  ) {}
}

@Component({
  selector: "app-sidebar-library",
  templateUrl: "sidebar-library.component.html",
  styleUrls: ["sidebar-library.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarLibraryComponent implements OnInit {
  data: Data = {};
  flatData: FlatNode[] = [];
  routePath = "";
  routeArtist = "";
  routeAlbum = "";
  routeCategory = "";
  constructor(
    private categoryService: CategoryService,
    private artistService: ArtistService,
    private albumService: AlbumService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const routes = this.router.url.split("/");
    this.routePath = routes[2];
    this.routeArtist = routes[3];
    this.routeAlbum = routes[4];
    this.categoryService.getCategories().subscribe((categories: Category[]) => {
      categories.map((category) => {
        this.data[category.name] = { name: category.name, type: "category", data: category, level: 0, children: {} };
      });
      this.updateTree(this.data);
      if (this.routePath === "artist")
        this.expandNode(this.flatData.find((node) => normalizeName(node.name) === this.routeArtist)!);
      if (this.routePath === "album") {
        this.loadAlbumFromUrl();
      }
    });
  }

  loadAlbumFromUrl() {
    console.log("heh");
    combineLatest([
      this.categoryService.getCategories(),
      this.albumService.getAlbumsByArtistName(this.routeArtist, true),
    ])
      .pipe(
        take(1),
        filter((categories) => categories !== null),
        map((data) => {
          console.log("heh", data);

          const [categories, albums] = data;
          if (categories && categories.length > 0) {
            categories.map((category) => {
              this.data[category.name] = {
                name: category.name,
                type: "category",
                data: category,
                level: 0,
                children: {},
              };
            });
          }
          this.updateTree(this.data);
          if (albums && albums.length > 0 && albums[0].category) {
            const categoryName = albums[0].category;
            const artistName = albums[0].artist?.join("-");
            const categoryNode = this.flatData.find((node) => node.name === categoryName && node.level === 0);
            if (artistName) {
              if (categoryNode) {
                this.expandNode(categoryNode).then(() => {
                  const artistNode = this.flatData.find(
                    (node) => normalizeName(artistName) === normalizeName(node.name) && node.level === 1
                  );
                  if (artistNode)
                    this.expandNode(artistNode).then(() => {
                      console.log(this.flatData);
                      const albumNode = this.flatData.find((node) => normalizeName(node.name) === this.routeAlbum && node.level === 2);
                      if (albumNode) this.selectNode(albumNode);
                    });
                });
              }
            }
          }
        })
      )
      .subscribe();
  }

  flattenData(data: Data) {
    let processChildren = false;
    let expandable = false;
    let childNodes: Data;
    Object.values(data).flatMap((node) => {
      if (processChildren) {
        processChildren = false;
        this.flattenData(childNodes);
      }
      if (node.children && Object.keys(node.children).length > 0) {
        childNodes = node.children;
        processChildren = true;
      }
      if (node.children) expandable = true;
      this.flatData.push(new FlatNode(node.name, node.level, node.data, node.expanded, expandable, node.selected));
    });
  }

  updateTree(data: Data) {
    this.flatData = [];
    this.flattenData(data);
  }

  selectNode(node: FlatNode) {
    let path = "";

    this.flatData.forEach((n) => {
      if (node === n) n.selected = true;
      else n.selected = false;
    });
    const name = normalizeName(node.name);
    if (node.level === 0) this.data[node.name].selected = true;
    if (node.level === 1) this.data[node.data!.category!].children![name].selected = true;
    if (node.level === 2) {
      const album: Album = node.data as Album;
      const artistName = normalizeName(album.artist!.join("-"));
      this.data[node.data!.category!].children![artistName].selected = true;
      path = "album";
      this.router.navigate(["library", path, artistName, normalizeName(node.name)]);
    }
  }

  getCollapsedParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = node.level;

    if (currentLevel < 1) {
      return null;
    }

    const index = this.flatData.indexOf(node) - 1;

    for (let i = index; i >= 0; i--) {
      const currentNode = this.flatData[i];

      if (currentNode.level < currentLevel) {
        if (!currentNode.expanded) return currentNode;
        else {
          return this.getCollapsedParentNode(currentNode);
        }
      }
    }
    return null;
  }

  isParentNodeCollapsed(node: FlatNode): boolean {
    const parent = this.getCollapsedParentNode(node);
    if (!parent) return false;
    else return true;
  }

  async expandNode(node: FlatNode): Promise<void> {
    node.expanded = !node.expanded;
    if (node.level === 0) {
      const categoryName = node.name;
      this.data[categoryName].expanded = node.expanded;
      // If we're expanding the node and it hasn't been loaded before then load the children
      if (node.expanded && Object.values(this.data[categoryName].children!).length === 0)
        await new Promise<void>((resolve, reject) =>
          this.artistService
            .getArtistsByCategory(categoryName)
            .pipe(take(1))
            .subscribe((artists: Artist[]) => {
              artists.map((artist: Artist) => {
                const artistName = normalizeName(artist.name);
                if (!this.data[categoryName].children!.hasOwnProperty(artistName)) {
                  this.data[categoryName].children![artistName] = {
                    name: artist.name,
                    data: artist,
                    type: "artist",
                    level: 1,
                    children: {},
                  };
                }
              });
              this.updateTree(this.data);
              resolve();
            })
        );
    }
    if (node.level === 1) {
      const normalizedArtistName = normalizeName(node.name);
      const categoryName = node.data?.category;
      if (categoryName) {
        this.data[categoryName].children![normalizedArtistName].expanded = node.expanded;
        // If we're expanding the node and it hasn't been loaded before then load the children
        if (
          node.expanded &&
          Object.values(this.data[categoryName].children![normalizedArtistName].children!).length === 0
        )
          await new Promise<void>((resolve, reject) =>
            this.albumService
              .getAlbumsByArtistName(normalizeName(normalizedArtistName))
              .pipe(take(1))
              .subscribe((albums: Album[]) => {
                albums.map((album: Album) => {
                  const normalizedAlbumName = normalizeName(album.name);
                  if (
                    !this.data[categoryName].children![normalizedArtistName].children!.hasOwnProperty(
                      normalizedAlbumName
                    )
                  ) {
                    this.data[categoryName].children![normalizedArtistName].children![normalizedAlbumName] = {
                      name: album.name,
                      data: album,
                      type: "album",
                      level: 2,
                    };
                  }
                });
                this.updateTree(this.data);
                resolve();
              })
          );
      }
    }
  }
}
