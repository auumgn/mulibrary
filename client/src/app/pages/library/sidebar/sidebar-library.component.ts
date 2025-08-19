import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { CategoryService } from "src/app/core/services/category.service";
import { EMPTY, combineLatest, distinct, distinctUntilChanged, filter, map, startWith, switchMap, take } from "rxjs";
import { Category } from "src/app/shared/models/category.model";
import { ArtistService } from "src/app/core/services/artist.service";
import { Artist } from "src/app/shared/models/artist.model";
import { Album } from "src/app/shared/models/album.model";
import { AlbumService } from "src/app/core/services/album.service";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { debug } from "src/app/shared/utils/debug-util";
import { TreeviewService } from "src/app/core/services/treeview-service";

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
    standalone: false
})
export class SidebarLibraryComponent implements OnInit {
  data: Data = {};
  flatData: FlatNode[] = [];
  routePath = "";
  routeArtist = "";
  routeAlbum = "";
  routeCategory = "";
  flattenChildNodes = false;
  previouslySelectedNode: FlatNode | undefined;
  constructor(
    private categoryService: CategoryService,
    private artistService: ArtistService,
    private albumService: AlbumService,
    private treeviewService: TreeviewService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    
    // TODO: remove the extra "getCategories" call
    //this.router.events.subscribe((sub) => console.log(sub, "sdflkjshdf"))
    this.treeviewService.activeNode$
      .pipe(
        filter((node) => node !== undefined),
        switchMap((node: FlatNode | undefined) => {
          console.log("activatedRoute params:", node, this.routeAlbum);

          if (node!.level === 0) {
            this.routePath = "category";
            this.routeCategory = normalizeName(node!.name);
            return this.loadCategoryPageFromUrl();
          }
          if (node!.level === 1) {
            this.routePath = "artist";
            this.routeArtist = normalizeName(node!.name);
            return this.loadArtistPageFromUrl();
          }
          if (node!.level === 2) {
            this.routePath = "album";
            const album = node!.data as Album;
            this.routeArtist = normalizeName(album.artist!.join("-"));
            this.routeAlbum = normalizeName(node!.name);
            console.log('hehe');
            
            return this.loadAlbumPageFromUrl();
          }
          return EMPTY;
        })
      )
      .subscribe();

    if (!this.routePath) {
      this.categoryService.getCategories(true).subscribe((categories: Category[]) => {
        console.log('test');
        
        categories.map((category) => {
          this.data[category.name] = { name: category.name, type: "category", data: category, level: 0, children: {} };
        });
        this.updateTree(this.data);
      });
    }
  }

  loadCategoryPageFromUrl() {
    return this.categoryService.getCategories().pipe(take(1), map(categories => {
      this.addCategoriesToDatabase(categories);
      const categoryNode = this.flatData.find((node) => node.name === this.routeCategory && node.level === 0);
      if (categoryNode) this.selectNode(categoryNode);
    }))
  }

  loadArtistPageFromUrl() {
    return combineLatest([
      this.categoryService.getCategories(),
      this.albumService.getAlbumsByArtistName(this.routeArtist, true),
    ]).pipe(
      take(1),
      map(([categories, albums]) => {
        debug("loading ARTIST page from url", categories, albums);

        this.addCategoriesToDatabase(categories);
        this.findAndExpandCategory(albums).then(() => {
          const artistNode = this.flatData.find(
            (node) => normalizeName(node.name) === this.routeArtist && node.level === 1
          );
          if (artistNode) this.selectNode(artistNode);
        });
      })
    );
  }

  loadAlbumPageFromUrl() {
    return combineLatest([
      this.categoryService.getCategories(),
      // TODO: only need to get category of artist = get category by artist?
      this.albumService.getAlbumsByArtistName(this.routeArtist, true),
    ]).pipe(
      take(1),
      filter((categories) => categories !== null),
      map((data) => {
        debug("loading ALBUM page from url", data);
        const [categories, albums] = data;
        this.addCategoriesToDatabase(categories);

        this.findAndExpandCategory(albums).then(() => {
          const artistName = albums[0].artist?.join("-");
          if (artistName) {
            const artistNode = this.flatData.find(
              (node) => normalizeName(artistName) === normalizeName(node.name) && node.level === 1
            );
            if (artistNode)
              this.expandNode(artistNode, true).then(() => {
                console.log(this.flatData);
                const albumNode = this.flatData.find(
                  (node) => normalizeName(node.name) === this.routeAlbum && node.level === 2
                );
                console.log("albumnode", albumNode);
                if (albumNode) this.selectNode(albumNode);
              });
          }
        });
      })
    );
  }

  async findAndExpandCategory(albums: Album[]): Promise<void> {
    if (albums && albums.length > 0 && albums[0].category) {
      const categoryName = albums[0].category;
      const categoryNode = this.flatData.find((node) => node.name === categoryName && node.level === 0);

      if (categoryNode) {
        return this.expandNode(categoryNode, true);
      }
    }
  }

  addCategoriesToDatabase(categories: Category[]) {
    categories
      .filter((category) => !this.data[category.name])
      .map((category) => {
        this.data[category.name] = {
          name: category.name,
          type: "category",
          data: category,
          level: 0,
          children: {},
        };
      });

    this.updateTree(this.data);
  }

  flattenData(data: Data) {
    //console.log("flattening data", data);

    let childNodes: Data | undefined;
    let previousNode: any;
    let expandable = false;
    for (let i = 0; i < Object.values(data).length; i++) {
      const node = Object.values(data)[i];
      //debug("attempting to process", node.name)
      if (node.children && Object.keys(node.children).length > 0) {
        //debug("children found", node.children)
        //debug('pushing node to flatData', new FlatNode(node.name, node.level, node.data, node.expanded, true, node.selected))
        this.flatData.push(new FlatNode(node.name, node.level, node.data, node.expanded, true, node.selected));
        this.flattenData(node.children);
        continue;
      }

      // add caret icon if node can have children
      if (node.children) expandable = true;
      //debug('pushing node to flatData', new FlatNode(node.name, node.level, node.data, node.expanded, expandable, node.selected))
      this.flatData.push(new FlatNode(node.name, node.level, node.data, node.expanded, expandable, node.selected));
    }
  }

  // TODO instead of wiping current flatData, update existing one (add/update nodes, no need to remove I think)
  updateTree(data: Data) {
    //debug("updating tree, data before update?:", data)
    this.flatData = [];
    this.flattenData(data);
    //debug("updating tree, flatdata after update?:", this.flatData);
  }

  selectNode(node: FlatNode, navigate = false) {
    debug("selecting node", node, navigate);
    this.flatData.forEach((n) => {
      if (node === n) n.selected = true;
      else n.selected = false;
    });
    this.toggleDataNodeSelection(this.previouslySelectedNode, false);
    this.toggleDataNodeSelection(node, true);
    this.previouslySelectedNode = node;

    const name = normalizeName(node.name);

    if (navigate) {
      if (node.level === 0) this.router.navigate(['library', 'category', name])
      if (node.level === 1) this.router.navigate(['library', 'artist', name]);
      if (node.level === 2) {
        const album: Album = node.data as Album;
        const artistName = normalizeName(album.artist!.join("-"));
        this.router.navigate(["library", "album", artistName, name]);
      }
      // this.treeviewService.updateActiveNode(node);
    }
    this.updateTree(this.data);
  }

  toggleDataNodeSelection(node: FlatNode | undefined, selected: boolean) {
    debug("changing selected field in Data to", selected, "node:", node);
    if (node) {
      const name = normalizeName(node.name);
      if (node.level === 0) {
        this.data[node.name].selected = selected;
      }
      if (node.level === 1) {
        if (this.data[node.data!.category!].children) {
          this.data[node.data!.category!].children![name].selected = selected;
        } else {
          console.error("Unable to find child node of:", node);
        }
      }
      if (node.level === 2) {
        const album: Album = node.data as Album;
        const artistName = normalizeName(album.artist!.join("-"));
        this.data[node.data!.category!].children![artistName].children![name].selected = selected;
      }
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

  async expandNode(node: FlatNode, force = false): Promise<void> {
    node.expanded = !node.expanded;
    if (force) node.expanded = true;
    // Expand category
    if (node.level === 0) {
      debug("expanding category", node);
      const categoryName = node.name;
      this.data[categoryName].expanded = node.expanded;
      // fetch children if missing
      if (node.expanded && Object.values(this.data[categoryName].children!).length === 0)
        await new Promise<void>((resolve, reject) =>
          this.artistService.getArtistsByCategory(normalizeName(categoryName), true).subscribe((artists: Artist[]) => {
            artists.map((artist: Artist) => {
              const artistName = normalizeName(artist.name);
              if (!this.data[categoryName].children!.hasOwnProperty(artistName)) {
                this.data[categoryName].children![artistName] = {
                  name: artist.name,
                  data: artist,
                  type: "artist",
                  level: 1,
                  children: {},
                  expanded: false,
                };
              }
            });
            this.updateTree(this.data);
            resolve();
          })
        );
    }
    // Expand artist
    if (node.level === 1) {
      debug("expanding artist", node);
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
        else {
          this.updateTree(this.data);
        }
      }
    }
  }
}
