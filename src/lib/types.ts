export type JobTemplate = {
  id: string;
  title: string;
  description: string;
  userId?: string;
  createdAt?: any;
};

export type CandidateMatch = {
  cv: string;
  candidateName: string;
  matchScore: number;
  reasoning: string;
};
