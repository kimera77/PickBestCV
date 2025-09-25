"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { CandidateMatch } from "@/lib/types";

type AnalysisResultsProps = {
  result: { candidateMatches: CandidateMatch[] } | null;
  isLoading: boolean;
};

const getBadgeVariant = (score: number): 'destructive' | 'secondary' | 'default' => {
  if (score < 50) return 'destructive';
  if (score < 75) return 'secondary';
  return 'default';
};

const getInitials = (name: string) => {
    const parts = name.split(/[\s._-]+/);
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const ResultCard = ({ match }: { match: CandidateMatch }) => (
    <Card>
        <CardContent className="p-4">
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border-b-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>{getInitials(match.cv)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none truncate">{match.cv}</p>
                            <p className="text-sm text-muted-foreground">Puntuación de coincidencia: {match.matchScore}%</p>
                            <Progress value={match.matchScore} className="h-2" />
                        </div>
                        <Badge variant={getBadgeVariant(match.matchScore)} className="hidden sm:inline-flex">
                            {match.matchScore}% de coincidencia
                        </Badge>
                        <AccordionTrigger className="p-2 [&[data-state=open]>svg]:rotate-180" />
                    </div>
                    <AccordionContent className="pt-4 pl-16">
                        <h4 className="font-semibold mb-2">Razonamiento del análisis:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{match.reasoning}</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                            <Skeleton className="h-2 w-full" />
                        </div>
                         <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);


export default function AnalysisResults({ result, isLoading }: AnalysisResultsProps) {
  const hasResults = result && result.candidateMatches.length > 0;

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>2. Resultados del análisis</CardTitle>
                <CardDescription>
                    La IA está analizando los CVs. Esto puede tardar un momento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoadingSkeleton />
            </CardContent>
        </Card>
    );
  }

  if (!hasResults) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Resultados del análisis</CardTitle>
        <CardDescription>
          Lista clasificada de candidatos según su coincidencia con la descripción del trabajo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {result.candidateMatches.map((match, index) => (
                <ResultCard key={index} match={match} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
