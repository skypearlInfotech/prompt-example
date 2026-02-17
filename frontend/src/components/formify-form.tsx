"use client";

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FileText, Upload, Loader2, AlertCircle, CheckCircle2, TrendingUp, Award, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import axios from "axios";

const validationSchema = Yup.object().shape({
  inputType: Yup.string().oneOf(['text', 'file']).required(),
  jobDescriptionText: Yup.string().when('inputType', {
    is: 'text',
    then: (schema) => schema.required('Job description is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  resumeTexts: Yup.array().when('inputType', {
    is: 'text',
    then: (schema) => schema.of(Yup.string().required()).min(1, 'At least one resume is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  jobDescriptionFile: Yup.mixed().when('inputType', {
    is: 'file',
    then: (schema) => schema.required('Job description PDF is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  resumeFiles: Yup.array().when('inputType', {
    is: 'file',
    then: (schema) => schema.min(1, 'At least one resume PDF is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export function FormifyForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      inputType: 'text',
      jobDescriptionText: '',
      resumeTexts: [''],
      jobDescriptionFile: null as File | null,
      resumeFiles: [] as File[],
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setResult(null);
      try {
        let finalJobDescription = values.jobDescriptionText;
        let finalResumes: string[] = [];

        if (values.inputType === 'file') {
          toast({ title: "Processing PDFs", description: "Analyzing your files..." });
          if (values.jobDescriptionFile) {
            finalJobDescription = await extractTextFromPdf(values.jobDescriptionFile);
          }
          for (const file of values.resumeFiles) {
            const text = await extractTextFromPdf(file);
            finalResumes.push(text);
          }
        } else {
          finalResumes = values.resumeTexts.filter(text => text.trim());
        }

        const response = await axios.post(
          "http://localhost:8000/analyze",
          {
            resumes: finalResumes,
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

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      toast({
        variant: "destructive",
        title: "Invalid Files",
        description: "Only PDF files are allowed.",
      });
    }
    formik.setFieldValue('resumeFiles', [...formik.values.resumeFiles, ...pdfFiles]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {!result && (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl border-white/5 bg-zinc-950/50 backdrop-blur-xl">
          <CardHeader>
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
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-zinc-500 uppercase">Resume Content</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => formik.setFieldValue('resumeTexts', [...formik.values.resumeTexts, ''])}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Resume
                        </Button>
                      </div>
                      {formik.values.resumeTexts.map((text, idx) => (
                        <div key={idx} className="relative">
                          <Textarea
                            placeholder={`Paste resume ${idx + 1} content here...`}
                            className="min-h-[120px] bg-black border-white/10 focus:border-white transition-colors text-white pr-10"
                            value={text}
                            onChange={(e) => {
                              const newTexts = [...formik.values.resumeTexts];
                              newTexts[idx] = e.target.value;
                              formik.setFieldValue('resumeTexts', newTexts);
                            }}
                          />
                          {formik.values.resumeTexts.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
                              onClick={() => {
                                const newTexts = formik.values.resumeTexts.filter((_, i) => i !== idx);
                                formik.setFieldValue('resumeTexts', newTexts);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {formik.errors.resumeTexts && formik.touched.resumeTexts && (
                        <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.resumeTexts as string}</p>
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
                      <Label className="text-xs font-medium text-zinc-500 uppercase">Resume PDFs</Label>
                      <input type="file" id="resumeFiles" accept=".pdf" multiple className="hidden" onChange={handleMultipleFilesChange} />
                      <label htmlFor="resumeFiles" className={cn(
                        "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                        formik.values.resumeFiles.length > 0 ? "border-zinc-400 bg-white/5" : "border-white/5 hover:border-white/20 bg-black"
                      )}>
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-6 h-6 text-zinc-600" />
                          <p className="text-xs text-zinc-500">{formik.values.resumeFiles.length > 0 ? `${formik.values.resumeFiles.length} file(s) selected` : 'Upload Resume PDFs'}</p>
                        </div>
                      </label>
                      {formik.values.resumeFiles.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {formik.values.resumeFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-lg">
                              <div className="flex items-center gap-2 text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-zinc-500 hover:text-red-400 h-6 w-6 p-0"
                                onClick={() => {
                                  const newFiles = formik.values.resumeFiles.filter((_, i) => i !== idx);
                                  formik.setFieldValue('resumeFiles', newFiles);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {formik.errors.resumeFiles && formik.touched.resumeFiles && (
                        <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.resumeFiles as string}</p>
                      )}
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
                  <><TrendingUp className="mr-2 h-5 w-5" /> Analyze</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <Card className="border-white/10 bg-zinc-950 shadow-2xl overflow-hidden">
              {result?.analysis?.length && (
                <>
                  {result?.analysis?.map((resultItem: any, index: number) =>(
                    <div key={`key-${index}`}>
                      <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-8">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                          <CardTitle className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                            <Award className="w-6 h-6 text-zinc-400" /> Analysis Result of {resultItem.candidate}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                      <div className="space-y-8">

                        {/* ================= OVERALL SCORE ================= */}
                        <div className="flex items-center justify-between bg-zinc-900/40 p-6 rounded-xl border border-white/5">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              Overall Match Score 
                            </h3>
                            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                              {resultItem.reasoning}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-4xl font-bold text-white">
                              {resultItem.score}%
                            </div>
                            <Progress
                              value={resultItem.score}
                              className="h-2 mt-3 bg-zinc-800"
                            />
                          </div>
                        </div>

                        {/* ================= STRENGTHS SECTION ================= */}
                        <div className="bg-zinc-900/30 p-6 rounded-xl border border-emerald-500/10">
                          <h4 className="text-emerald-400 font-semibold mb-4 text-lg">
                            Strengths
                          </h4>

                          <div className="space-y-4">
                            {resultItem.strengths.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-950/60 p-4 rounded-lg border border-emerald-500/10"
                              >
                                <p className="text-sm text-zinc-300 mb-2">
                                  {item.split(":")[0]}
                                </p>

                                {/* Extract skills inside brackets */}
                                {item.includes("[") && (
                                  <div className="flex flex-wrap gap-2">
                                    {item
                                      .match(/\[(.*?)\]/)?.[1]
                                      .replace(/'/g, "")
                                      .split(",")
                                      .map((skill, i) => (
                                        <span
                                          key={i}
                                          className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        >
                                          {skill.trim()}
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ================= GAPS SECTION ================= */}
                        <div className="bg-zinc-900/30 p-6 rounded-xl border border-red-500/10">
                          <h4 className="text-red-400 font-semibold mb-4 text-lg">
                            Gaps Identified
                          </h4>

                          {resultItem.gaps.length === 0 ? (
                            <p className="text-sm text-emerald-400">
                              No major gaps identified 🎉
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {resultItem.gaps.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-zinc-950/60 p-4 rounded-lg border border-red-500/10"
                                >
                                  <p className="text-sm text-zinc-300 mb-2">
                                    {item.split(":")[0]}
                                  </p>

                                  {item.includes("[") && (
                                    <div className="flex flex-wrap gap-2">
                                      {item
                                        .match(/\[(.*?)\]/)?.[1]
                                        .replace(/'/g, "")
                                        .split(",")
                                        .map((skill, i) => (
                                          <span
                                            key={i}
                                            className="px-3 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                                          >
                                            {skill.trim()}
                                          </span>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </CardContent>
                    </div>
                  ))}
                </>
              )}
            <Button
                type="button"
                className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold text-lg rounded-xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
                onClick={()=>{
                  setResult(null);
                  formik.resetForm();
                }}
              >
                <TrendingUp className="mr-2 h-5 w-5" /> Start new analyze
              </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
