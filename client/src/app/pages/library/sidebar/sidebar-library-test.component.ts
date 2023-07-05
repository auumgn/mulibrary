import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from "@angular/material/tree";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CategoryService } from "src/app/core/services/category.service";
import { BehaviorSubject, map, pipe } from "rxjs";
import { Category } from "src/app/shared/models/category.model";
import { ArtistService } from "src/app/core/services/artist.service";
import { Artist } from "src/app/shared/models/artist.model";
import { Album } from "src/app/shared/models/album.model";
import { AlbumService } from "src/app/core/services/album.service";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface TreeNode {
  name: string;
  type: string;
  selected?: boolean;
  children?: TreeNode[];
  data?: Category | Artist | Album;
}

/** Flat node with expandable and level information */
/* interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
} */

export class ExampleFlatNode {
  constructor(
    public name: string,
    public level = 1,
   // public data?: Album | Artist,
    public expandable = false,
   // public selected = false,
  ) {}
}

export class ExtendedNode {
  constructor(public name: string,
    public level = 1,
    public expandable = false, 
    public parentName?: string ){
  }
}


@Component({
  selector: "app-sidebar-library-test",
  templateUrl: "sidebar-library-test.component.html",
  styleUrls: ["sidebar-library.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarLibraryTestComponent implements OnInit {
  data: TreeNode[] = [];
  constructor(
    private categoryService: CategoryService,
    private artistService: ArtistService,
    private albumService: AlbumService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(
        map((categories) => {
          categories.map((category) => {
            const node: TreeNode = { name: category.name, type: "category", children: [] };
            this.data.push(node);
          });
          return this.data;
        })
      )
      .subscribe((data: TreeNode[]) => (this.dataSource.data = data));
  }

  private _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
    //(node) => node.selected
  );
  selectedNode = new SelectionModel<ExampleFlatNode>(false);
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  //treeTracker = (index: number, node: ExampleFlatNode) => {console.log(node); return node};

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  node: ExampleFlatNode | undefined;
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  expandNode(node: ExampleFlatNode) {
    if (node.level === 0) {
      const categoryNode = this.data.find((category) => category.name === node.name);
      if (categoryNode && categoryNode.children && categoryNode.children.length === 0) {
        this.artistService
          .getArtistsByCategory(categoryNode.name)
          .pipe(
            map((artists) => {
              const artistNodes: TreeNode[] = [];
              artists.map((artist) => {
                const artistNode: TreeNode = { name: `${artist.category}__${artist.name}`, data: artist, type: "artist", children: [] };
                artistNodes.push(artistNode);
              });
              return artistNodes;
            })
          )
          .subscribe((nodes) => {
            const expandedNodes: ExampleFlatNode[] = [];
            categoryNode.children = nodes;
            this.treeControl.dataNodes.forEach((n) => {
              if (this.treeControl.isExpanded(n)) console.log(n.name);
              if (this.treeControl.isExpanded(n)) expandedNodes.push(n);
            });
            this.data.forEach((category) => {
              if (category.name === node.name) {
                category.children!.forEach((artist) => {
                    category.children = nodes;
              })
            }});
            this.dataSource.data = this.data;
            const ds = this.data.find(el => el.name === 'Minimal Wave')?.children![2].children!.length
            console.log("ds", ds, this.treeControl.dataNodes)
            expandedNodes.forEach((expandedNode) => { 
              const match = this.treeControl.dataNodes.find(
                (n) => n.name === expandedNode.name
              );
              if (match) console.log("MATCH", match.name)

              if (match) this.treeControl.expand(match);
            });
          });
      }
    }

    if (node.level === 1) {
      const categoryName = node.name.split('__')[0];
      const artistName = categoryName + '__' + node.name.split('__')[1];
      
      const categoryNode = this.data.find((category) => category.name === categoryName)
      const artistNode = categoryNode?.children?.find(artist => artist.name === artistName);

      if (artistNode && artistNode.children && artistNode.children.length === 0) {
        this.albumService
          .getAlbumsByArtistName(normalizeName(node.name.split('__')[1]))
          .pipe(
            map((albums) => {
              const albumNodes: TreeNode[] = [];
              albums.map((album) => {
                const albumNode: TreeNode = { name: `${album.category}__${album.artist?.join('--')}__${album.name}`, data: album, type: "album" };
                albumNodes.push(albumNode);
              });
              return albumNodes;
            })
          )
          .subscribe((nodes) => {
            const expandedNodes: ExampleFlatNode[] = [];
            artistNode.children = nodes;
            this.treeControl.dataNodes.forEach((n) => {
              if (this.treeControl.isExpanded(n)) expandedNodes.push(n);
            });
            /* const sds = this.dataSource.data.find(el => el.name === 'Minimal Wave')?.children![2].children!.length
            console.log("sds", sds, this.treeControl.dataNodes, this.dataSource.data) */
            console.log(nodes)
            this.data.forEach((category) => {
              if (category.name === categoryName) {
                category.children!.forEach((artist) => {
                  if (artist.name === artistName) {
                    // Update the artist object within this.data
                    artist.children = nodes;
                  }
                });
              }
            });
            this.dataSource.data = this.data;
            /* const sdds = this.dataSource.data.find(el => el.name === 'Minimal Wave')?.children![2].children!.length
            console.log("sdds", sdds, this.treeControl.dataNodes, this.dataSource.data) */
            expandedNodes.forEach((expandedNode) => {
              const match = this.treeControl.dataNodes.find(
                (n) => n.name === expandedNode.name 
              );
              if (match) this.treeControl.expand(match);
            });
          });
      }
    }
    /* 
    if (node.children.length === 0 && node.level === 0) {
      this.artistService.getArtistsByCategory(node.name)
    } */
  }

  getParentNode(node: ExampleFlatNode) {
    const currentLevel = this.treeControl.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const index = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = index; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.treeControl.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  selectNode(node: ExampleFlatNode) {
    this.selectedNode.select(node);
    let path = "";
    //this.dataSource.setActiveNode(node);

    //if (node.level === 0) path = 'category'
    //if (node.level === 1) path = 'artist'

    // open album component
    if (node.level === 2) {
      const artist = this.getParentNode(node);
      path = "album";
      if (artist && artist.name) {
        this.router.navigate(["library", path, normalizeName(artist.name.split('__')[1]), normalizeName(node.name.split('__')[2])]);
      }
    }
  }
}
