import { CollectionViewer, SelectionChange, DataSource } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, Injectable, OnInit, ViewEncapsulation } from "@angular/core";
import { BehaviorSubject, combineLatest, EMPTY, merge, Observable, of } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTreeModule } from "@angular/material/tree";
import { AlbumService } from "../../../core/services/album.service";
import { ArtistService } from "../../../core/services/artist.service";
import { Category } from "src/app/shared/models/category.model";
import { Artist } from "src/app/shared/models/artist.model";
import { Album } from "src/app/shared/models/album.model";
import { CategoryService } from "../../../core/services/category.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";

export class DynamicFlatNode {
  constructor(
    public item: string,
    public level = 1,
    public data?: Album | Artist,
    public expandable = false,
    public selected = false,
    public isLoading = false
  ) {}
}

@Injectable({ providedIn: "root" })
export class DynamicDatabase {
  artists: Artist[] = [];
  categories: Category[] = [];
  activeNode: string | undefined;
  constructor(
    private artistService: ArtistService,
    private categoryService: CategoryService,
    private albumService: AlbumService
  ) {}
  dataMap = new Map<Category | Artist | Album, Artist[] | Album[]>();
  data: DynamicFlatNode[] = [];

  initialData(
    path: string,
    data: { category?: string; artist?: string; album?: string }
  ): Observable<DynamicFlatNode[]> {
    let index = 0;

    if (path === "album" && data.artist) {
      let albums: Album[];
      return combineLatest([this.categoryService.getCategories(), this.getAlbumsByArtistName(data.artist)]).pipe(
        filter((categories) => categories !== null),
        switchMap((data) => {
          if (data[0] && data[0].length > 0) {
            data[0].map((category) => {
              this.data.push(new DynamicFlatNode(category.name, 0, category, true));
            });
          }
          if (data[1] && data[1].length > 0 && data[1][0].category) {
            albums = data[1];
            return this.getArtistsByCategory(data[1][0].category);
          }
          return EMPTY;
        }),
        map((artists) => {
          const nodes = artists.map((artist) => new DynamicFlatNode(artist.name, 1, artist, true));
          const categoryNode = this.data.find((category) => category.item === nodes[0].data?.category);

          if (categoryNode) {
            index = this.data.indexOf(categoryNode);
            this.data.splice(index + 1, 0, ...nodes);
          }

          const albumNodes = albums.map((album) => {
            if (normalizeName(album.name) === data.album) return new DynamicFlatNode(album.name, 2, album, false, true);
            else return new DynamicFlatNode(album.name, 2, album, false);
          });
          const artistNode = this.data.find((artist) => normalizeName(artist.item) === data.artist);
          if (artistNode) {
            index = this.data.indexOf(artistNode);
            this.data.splice(index + 1, 0, ...albumNodes);
          }
          return this.data;
        }),
        take(1)
      );
    }
    return EMPTY;
    /*     return this.categoryService.getCategories().pipe(
      filter((categories) => categories !== null),
      switchMap((categories) => {
        categories!.map((category) => {
          this.data.push(new DynamicFlatNode(category.name, 0, category, true));
        });
        if (data.category) {
          return this.getArtistsByCategory(data.category);
        }
        return EMPTY;
      }),
      switchMap((artists) => {
        if (data) return EMPTY;
      }),
      switchMap((nodes) => {
        
      })
    ); */
  }

  getChildren(node: Category | Artist | Album): Artist[] | Album[] | undefined {
    return this.dataMap.get(node);
  }

  getArtistsByCategory(category: string, force = false): Observable<Artist[]> {
    return this.artistService.getArtistsByCategory(category, force);
  }

  getAlbumsByArtistName(name: string): Observable<Album[]> {
    return this.albumService.getAlbumsByArtistName(normalizeName(name));
  }

  isExpandable(node: Category | Artist | Album): boolean {
    return this.dataMap.has(node);
  }
}

export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DynamicDatabase,
    private albumService: AlbumService
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if ((change as SelectionChange<DynamicFlatNode>).added || (change as SelectionChange<DynamicFlatNode>).removed) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  setActiveNode(node: DynamicFlatNode) {
    this._treeControl.dataNodes.forEach((node) => (node.selected = false));
    node.selected = true;
  }

  async toggleNode(node: DynamicFlatNode, expand: boolean, force = false) {
    console.log(node);

    const index = this.data.indexOf(node);
    node.isLoading = true;

    // EXPAND NODE
    if (expand) {
      
      if (node.level === 0) {
        this._database
          .getArtistsByCategory(node.data!.name, force)
          .pipe(take(1))
          .subscribe((artists) => {
            const nodes = artists.map((artist) => new DynamicFlatNode(artist.name, node.level + 1, artist, true));

            this.data.splice(index + 1, 0, ...nodes);
            this.dataChange.next(this.data);
            node.isLoading = false;
            return;
          });
      }
      if (node.level === 1) {
        if (node.data && node.data.id) {
          this._database
            .getAlbumsByArtistName(node.data.name)
            .pipe(take(1))
            .subscribe((albums) => {
              const nodes = albums.map((album) => new DynamicFlatNode(album.name, node.level + 1, album, false));

              this.data.splice(index + 1, 0, ...nodes);
              this.dataChange.next(this.data);
              node.isLoading = false;
            });
        } else console.error(node);
      }
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {}
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);
      node.isLoading = false;
    }
  }
}

@Component({
  selector: "app-sidebar-library",
  templateUrl: "./sidebar-library.component.html",
  styleUrls: ["./sidebar-library.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarLibraryComponent implements OnInit {
  constructor(
    private database: DynamicDatabase,
    private albumService: AlbumService,
    private artistService: ArtistService,
    private categoryService: CategoryService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router
  ) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database, albumService);
  }
  data: DynamicFlatNode[] = [];

  categories: Category[] = [];
  artists: Artist[] = [];

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

  /*   constructor(
    private albumService: AlbumService,
    private artistService: ArtistService,
    private categoryService: CategoryService
  ) {}
  data: { [name: string]: { name: string; artists: { name: string; albums: { name: string }[] }[] } } = {};
  categories: Category[] = [];
  artists: Artist[] = [];
  dataArray = Object.values(this.data);
  ngOnInit(): void {
    this.artistService.getArtists().subscribe((artists) => {
      this.artists = artists;
    });

    this.categoryService.getCategories().subscribe((categories) => {if (categories) this.categories = categories})
  }
   */
  ngOnInit(): void {
    const routes = this.router.url.split("/");
    const path = routes[2];
    const artistName = routes[3];
    const albumName = routes[4];
    let index = 0;
    if (path === "album" && artistName) {

      let albums: Album[];
      combineLatest([this.categoryService.getCategories(), this.albumService.getAlbumsByArtistName(artistName, true)])
        .pipe(
          take(1),
          filter((categories) => categories !== null),
          switchMap((data) => {

            if (data[0] && data[0].length > 0) {

              data[0].map((category) => {
                this.data.push(new DynamicFlatNode(category.name, 0, category, true));
              });

              this.dataSource.data = this.data;
            }
            if (data[1] && data[1].length > 0 && data[1][0].category) {
              const categoryNode = this.data.find((category) => category.item === data[1][0].category);
              if (categoryNode) {
                this.treeControl.expand(categoryNode);
              }
              
              albums = data[1];
              return this.artistService.getArtistsByCategory(data[1][0].category);
            }
            return EMPTY;
          }),
          tap(() => {
            const artistNode = this.data.find(artist => normalizeName(artist.item) === artistName);
            if (artistNode) {
              this.treeControl.expand(artistNode);
            }
            const albumNode = this.data.find(album => normalizeName(album.item) === albumName)
            if (albumNode) this.dataSource.setActiveNode(albumNode);

            /*           const nodes = artists.
            map((artist) => new DynamicFlatNode(artist.name, 1, artist, true));
          const categoryNode = this.data.find((category) => category.item === nodes[0].data?.category);
          console.log(categoryNode);
          
          if (categoryNode) {
            index = this.data.indexOf(categoryNode);
            this.data.splice(index + 1, 0, ...nodes);
          }

          const albumNodes = albums.map((album) => {if (normalizeName(album.name) === albumName) return new DynamicFlatNode(album.name, 2, album, false, true); else return new DynamicFlatNode(album.name, 2, album, false)});
          const artistNode = this.data.find((artist) => normalizeName(artist.item) === arti);
          if (artistNode) {
            index = this.data.indexOf(artistNode);
            this.data.splice(index + 1, 0, ...albumNodes);
          }
          return this.data; */
          }),
        )
        .subscribe();
    }
    /* this.database
      .initialData(path, { artist: routes[3], album: routes[4] })

      .subscribe((data) => {
        this.dataSource.data = data; */
    /*         console.log(data);
        console.log("Asdfkuhsdkfhusdf");

        if (data && data.category && path === "album") {
          const categoryNode = this.dataSource.data.find((category) => category.item === data?.category);
          if (categoryNode) this.dataSource.toggleNode(categoryNode, true);
          const artistNode = this.dataSource.data.find((artist) => artist.item === normalizeName(data?.name));
          if (categoryNode) console.log(this.dataSource);

          if (artistNode) this.dataSource.toggleNode(artistNode, true); */

    // this.dataSource.data = data[0];
    // const artists = data[1];
    /* 
        if (artists) {
          this.artists = artists;
          this.data = {};
          artists.forEach((artist: Artist) => {
            if (artist && artist.category) {
              if (!this.data[artist.category]) {
                const category = { name: artist.category, type: "category", children: [] };
                this.data[artist.category] = category;
              }
              this.data[artist.category].children.push({
                name: artist.name,
                type: "artist",
                data: artist,
                children: [],
              });
            }
          });
        } */
    /*  }); */
  }

  selectNode(node: DynamicFlatNode) {
    let path = "";
    if (node.data) {
      this.dataSource.setActiveNode(node);
      //if (node.level === 0) path = 'category'
      //if (node.level === 1) path = 'artist'

      // open album component
      if (node.level === 2) {
        path = "album";
        const album: Album = node.data;
        if (album.artist) {
          const artistName = album.artist.map((artist) => normalizeName(artist)).join("-");
          this.router.navigate(["library", path, artistName, normalizeName(album.name)]);
        } else console.error("album artist missing:", album);
      }
    }
  }
}
