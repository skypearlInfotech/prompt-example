"use client";

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FileText, Upload, Loader2, AlertCircle, CheckCircle2, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { scoreResume, type ScoreResumeOutput } from '@/ai/flows/score-resume-flow';
import axios from "axios";

const validationSchema = Yup.object().shape({
  inputType: Yup.string().oneOf(['text', 'file']).required(),
  jobDescriptionText: Yup.string().when('inputType', {
    is: 'text',
    then: (schema) => schema.required('Job description is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  resumeText: Yup.string().when('inputType', {
    is: 'text',
    then: (schema) => schema.required('Resume text is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  jobDescriptionFile: Yup.mixed().when('inputType', {
    is: 'file',
    then: (schema) => schema.required('Job description PDF is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  resumeFile: Yup.mixed().when('inputType', {
    is: 'file',
    then: (schema) => schema.required('Resume PDF is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export function FormifyForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResumeOutput | null>(null);

  const formik = useFormik({
    initialValues: {
      inputType: 'text',
      jobDescriptionText: '',
      resumeText: '',
      jobDescriptionFile: null as File | null,
      resumeFile: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setResult(null);
      try {
        let finalJobDescription = values.jobDescriptionText;
        let finalResume = values.resumeText;

        if (values.inputType === 'file') {
          toast({ title: "Processing PDFs", description: "Analyzing your files..." });
          if (values.jobDescriptionFile) {
            finalJobDescription = await extractTextFromPdf(values.jobDescriptionFile);
          }
          if (values.resumeFile) {
            finalResume = await extractTextFromPdf(values.resumeFile);
          }
        }

        const response = await axios.post(
          "http://localhost:8000/analyze", // change to your full backend URL if needed
          {
            resume: finalResume,
            job_description: finalJobDescription,
          }
        );

        setResult(response.data);
        toast({
          title: "Analysis Complete",
          description: "Your resume score has been calculated.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred during AI analysis.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload a PDF file only.",
      });
      return;
    }
    formik.setFieldValue(fieldName, file);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline font-bold text-center text-white">
            Analyze Application
          </CardTitle>
          <CardDescription className="text-center text-zinc-500">
            Select your input method and provide the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                Input Method
              </Label>
              <RadioGroup
                value={formik.values.inputType}
                onValueChange={(val) => formik.setFieldValue('inputType', val)}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div 
                  onClick={() => formik.setFieldValue('inputType', 'text')}
                  className={cn(
                    "flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                    formik.values.inputType === 'text' ? "border-white bg-white/5 ring-1 ring-white/20" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <RadioGroupItem value="text" id="input-text" className="sr-only" />
                  <Label htmlFor="input-text" className="flex flex-col items-center gap-2 text-center cursor-pointer">
                    <FileText className={cn("w-6 h-6", formik.values.inputType === 'text' ? "text-white" : "text-zinc-600")} />
                    <span className={cn("font-medium", formik.values.inputType === 'text' ? "text-white" : "text-zinc-600")}>Manual Text</span>
                  </Label>
                </div>

                <div 
                  onClick={() => formik.setFieldValue('inputType', 'file')}
                  className={cn(
                    "flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                    formik.values.inputType === 'file' ? "border-white bg-white/5 ring-1 ring-white/20" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <RadioGroupItem value="file" id="input-file" className="sr-only" />
                  <Label htmlFor="input-file" className="flex flex-col items-center gap-2 text-center cursor-pointer">
                    <Upload className={cn("w-6 h-6", formik.values.inputType === 'file' ? "text-white" : "text-zinc-600")} />
                    <span className={cn("font-medium", formik.values.inputType === 'file' ? "text-white" : "text-zinc-600")}>PDF Upload</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-6">
              {formik.values.inputType === 'text' ? (
                <div key="text-inputs" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="jobDescriptionText" className="text-xs font-medium text-zinc-500 uppercase">Job Description</Label>
                    <Textarea
                      id="jobDescriptionText"
                      name="jobDescriptionText"
                      placeholder="Paste the job description here..."
                      className="min-h-[120px] bg-black border-white/10 focus:border-white transition-colors text-white"
                      value={formik.values.jobDescriptionText}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.jobDescriptionText && formik.touched.jobDescriptionText && (
                      <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.jobDescriptionText}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumeText" className="text-xs font-medium text-zinc-500 uppercase">Resume Content</Label>
                    <Textarea
                      id="resumeText"
                      name="resumeText"
                      placeholder="Paste your resume content here..."
                      className="min-h-[120px] bg-black border-white/10 focus:border-white transition-colors text-white"
                      value={formik.values.resumeText}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.resumeText && formik.touched.resumeText && (
                      <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.resumeText}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div key="file-inputs" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-500 uppercase">Job Description PDF</Label>
                    <input type="file" id="jobDescriptionFile" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, 'jobDescriptionFile')} />
                    <label htmlFor="jobDescriptionFile" className={cn(
                      "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                      formik.values.jobDescriptionFile ? "border-zinc-400 bg-white/5" : "border-white/5 hover:border-white/20 bg-black"
                    )}>
                      {formik.values.jobDescriptionFile ? (
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CheckCircle2 className="w-5 h-5 text-zinc-400" />
                          <span className="text-sm">{(formik.values.jobDescriptionFile as any).name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-6 h-6 text-zinc-600" />
                          <p className="text-xs text-zinc-500">Upload JD PDF</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-500 uppercase">Resume PDF</Label>
                    <input type="file" id="resumeFile" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, 'resumeFile')} />
                    <label htmlFor="resumeFile" className={cn(
                      "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                      formik.values.resumeFile ? "border-zinc-400 bg-white/5" : "border-white/5 hover:border-white/20 bg-black"
                    )}>
                      {formik.values.resumeFile ? (
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CheckCircle2 className="w-5 h-5 text-zinc-400" />
                          <span className="text-sm">{(formik.values.resumeFile as any).name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-6 h-6 text-zinc-600" />
                          <p className="text-xs text-zinc-500">Upload Resume PDF</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold text-lg rounded-xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing with AI...</>
              ) : (
                <><TrendingUp className="mr-2 h-5 w-5" /> Score Resume</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <Card className="border-white/10 bg-zinc-950 shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                    <Award className="w-6 h-6 text-zinc-400" /> Analysis Result
                  </CardTitle>
                  <CardDescription>AI-powered matching breakdown</CardDescription>
                </div>
                <div className="flex flex-col items-center bg-white/5 px-8 py-4 rounded-2xl border border-white/10">
                  <span className="text-4xl font-black text-white">{result.overallScore}%</span>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Match Score</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-zinc-400 font-semibold w-[200px]">Category</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Performance</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.categories.map((cat, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="font-medium text-white">
                        <div className="flex flex-col">
                          <span>{cat.name}</span>
                          <span className="text-xs text-zinc-500 font-normal mt-0.5">{cat.feedback}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Progress value={cat.score} className="h-2 bg-zinc-900" />
                      </TableCell>
                      <TableCell className="text-right font-mono text-zinc-300">{cat.score}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-8 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-500" /> AI Recommendations
                </h4>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                      <p className="leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
