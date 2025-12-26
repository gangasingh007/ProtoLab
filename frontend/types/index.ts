export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'FACULTY' | 'LAB_MANAGER' | 'COLLABORATOR' | 'ADMIN';
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: TeamMember[];
  _count?: {
    experiments: number;
    papers: number;
  };
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  user: User;
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis?: string;
  method?: string;
  observations?: string;
  results?: string;
  failures?: string;
  nextSteps?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETE';
  teamId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
  createdBy?: User;
  comments?: Comment[];
  papers?: ExperimentPaper[];
  tags?: Tag[];
  codeVersions?: CodeVersion[];
}

export interface Paper {
  id: string;
  title: string;
  authors?: string;
  url?: string;
  pdfUrl?: string;
  summary?: string;
  findings?: string;
  methodology?: string;
  limitations?: string;
  teamId: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
  uploadedBy?: User;
  experiments?: ExperimentPaper[];
}

export interface ExperimentPaper {
  id: string;
  experimentId: string;
  paperId: string;
  linkedAt: string;
  experiment?: Experiment;
  paper?: Paper;
}

export interface Comment {
  id: string;
  content: string;
  experimentId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  mentions?: string[];
}

export interface Tag {
  id: string;
  name: string;
  experiments?: Experiment[];
}

export interface CodeVersion {
  id: string;
  commitHash?: string;
  branch?: string;
  environment?: string;
  experimentId: string;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'experiment' | 'paper' | 'method' | 'metric' | 'user' | 'tag';
  size?: number;
  color?: string;
  data?: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    experimentCount: number;
    paperCount: number;
  };
}

export interface AIInsight {
  summary?: string;
  suggestions?: string[];
  patterns?: string[];
  recommendations?: string[];
}
