export interface VFSNode {
  type: "file" | "dir";
  name: string;
  content?: string;
  children?: Record<string, VFSNode>;
}

export class VirtualFileSystem {
  root: VFSNode;
  
  constructor() {
    this.root = this.loadFromStorage() || {
      type: "dir",
      name: "/",
      children: {}
    };
  }

  saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("gradeflow_vfs", JSON.stringify(this.root));
    }
  }

  loadFromStorage(): VFSNode | null {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("gradeflow_vfs");
      if (data) {
        try {
          return JSON.parse(data);
        } catch(e) {}
      }
    }
    return null;
  }
  
  resolvePath(cwd: string, path: string): string[] {
    let parts = path.startsWith("/") ? path.split("/") : [...cwd.split("/"), ...path.split("/")];
    let resolved: string[] = [];
    for (let p of parts) {
      if (!p || p === ".") continue;
      if (p === "..") resolved.pop();
      else resolved.push(p);
    }
    return resolved;
  }
  
  getNode(path: string[]): VFSNode | null {
    let curr = this.root;
    for (let p of path) {
      if (curr.type !== "dir" || !curr.children) return null;
      curr = curr.children[p];
      if (!curr) return null;
    }
    return curr;
  }

  mkdir(cwd: string, dir: string): string | null {
    const p = this.resolvePath(cwd, dir);
    if (p.length === 0) return "Cannot create root";
    const name = p.pop()!;
    let parent = this.getNode(p);
    if (!parent || parent.type !== "dir") return "Parent directory does not exist";
    if (parent.children![name]) return "File or directory already exists";
    
    parent.children![name] = { type: "dir", name, children: {} };
    this.saveToStorage();
    return null; // success
  }

  touch(cwd: string, file: string): string | null {
    const p = this.resolvePath(cwd, file);
    if (p.length === 0) return "Invalid path";
    const name = p.pop()!;
    let parent = this.getNode(p);
    if (!parent || parent.type !== "dir") return "Parent directory does not exist";
    if (!parent.children![name]) {
       parent.children![name] = { type: "file", name, content: "" };
       this.saveToStorage();
    }
    return null;
  }
  
  write(cwd: string, file: string, content: string): string | null {
    const p = this.resolvePath(cwd, file);
    if (p.length === 0) return "Invalid path";
    const name = p.pop()!;
    let parent = this.getNode(p);
    if (!parent || parent.type !== "dir") return "Parent directory does not exist";
    let node = parent.children![name];
    if (node && node.type === "dir") return "Is a directory";
    
    parent.children![name] = { type: "file", name, content };
    this.saveToStorage();
    return null;
  }

  read(cwd: string, file: string): { content?: string, error?: string } {
    const p = this.resolvePath(cwd, file);
    const node = this.getNode(p);
    if (!node) return { error: "File not found" };
    if (node.type === "dir") return { error: "Is a directory" };
    return { content: node.content || "" };
  }

  ls(cwd: string, dir: string = ""): { items?: VFSNode[], error?: string } {
    const p = this.resolvePath(cwd, dir);
    const node = this.getNode(p);
    if (!node) return { error: "Directory not found" };
    if (node.type !== "dir" || !node.children) return { error: "Not a directory" };
    return { items: Object.values(node.children) };
  }
  
  rm(cwd: string, target: string): string | null {
     const p = this.resolvePath(cwd, target);
     if (p.length === 0) return "Cannot remove root";
     const name = p.pop()!;
     const parent = this.getNode(p);
     if (!parent || parent.type !== "dir" || !parent.children) return "Parent not found";
     if (!parent.children[name]) return "No such file or directory";
     
     delete parent.children[name];
     this.saveToStorage();
     return null;
  }
}
