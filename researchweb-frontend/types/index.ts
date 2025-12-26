export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'COLLABORATOR';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: TeamMember[];
  userRole?: string;
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
  status: 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETE';
  createdAt: string;
  updatedAt: string;
  authorId: string;
  teamId: string;
  author: User;
  comments: Comment[];
  tags: Tag[];
  experimentPapers?: ExperimentPaper[];
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
  uploadedAt: string;
  uploadedById: string;
  teamId: string;
  uploadedBy: User;
  experimentPapers?: ExperimentPaper[];
}

export interface Comment {
  id: string;
  content: string;
  mentions: string[];
  createdAt: string;
  authorId: string;
  experimentId: string;
  author: User;
}

export interface Tag {
  id: string;
  name: string;
}

export interface ExperimentPaper {
  id: string;
  experimentId: string;
  paperId: string;
  paper: Paper;
  experiment?: Experiment;
}

export interface CodeVersion {
  id: string;
  commitHash: string;
  branch: string;
  repoUrl?: string;
  environment?: string;
  createdAt: string;
  experimentId: string;
}

export interface PresenceData {
  userId: string;
  userName: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: number;
}
