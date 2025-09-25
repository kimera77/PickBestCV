export type JobTemplate = {
  id: string;
  title: string;
  description: string;
};

export type CandidateMatch = {
  cv: string;
  candidateName: string;
  matchScore: number;
  reasoning: string;
};
