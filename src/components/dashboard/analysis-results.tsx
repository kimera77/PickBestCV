"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import type { CandidateMatch } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

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
    if (!name) return '??';
    const parts = name.split(/[\s._-]+/);
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const ResultCard = ({ match }: { match: CandidateMatch }) => {
    const { t } = useTranslation();
    return (
    <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4">
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border-b-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border">
                            <AvatarFallback>{getInitials(match.candidateName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none truncate">{match.candidateName}</p>
                            <p className="text-xs text-muted-foreground truncate">{match.cv}</p>
                            <Progress value={match.matchScore} className="h-2" />
                        </div>
                        <Badge variant={getBadgeVariant(match.matchScore)} className="hidden sm:inline-flex">
                            {match.matchScore}%
                        </Badge>
                        <AccordionTrigger className="p-2 [&[data-state=open]>svg]:rotate-180" />
                    </div>
                    <AccordionContent className="pt-4 pl-[64px] text-sm text-muted-foreground">
                        <h4 className="font-semibold mb-2 text-foreground">{t('analysisResults.recommendation')}:</h4>
                        <p className="whitespace-pre-wrap">{match.reasoning}</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
    );
};

const LoadingSkeleton = () => {
    const { t } = useTranslation();
    return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
            <p className="text-lg font-medium">{t('analysisResults.analyzing')}</p>
            <p className="text-sm text-muted-foreground">{t('analysisResults.processingDesc')}</p>
        </div>
    </div>
    );
};


export default function AnalysisResults({ result, isLoading }: AnalysisResultsProps) {
  const hasResults = result && result.candidateMatches.length > 0;
  const { t } = useTranslation();

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>2.</span>
                    {t('analysisResults.results')}
                </CardTitle>
                <CardDescription>
                    {t('analysisResults.analyzing')}
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
        <CardTitle  className="flex items-center gap-2">
            <span>2.</span>
            {t('analysisResults.results')}
        </CardTitle>
        <CardDescription>
          {t('analysisResults.overallRanking')}
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
