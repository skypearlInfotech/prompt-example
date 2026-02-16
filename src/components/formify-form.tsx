
"use client";

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FileText, Upload, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [apiResponse, setApiResponse] = useState<any>(null);

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
      setApiResponse(null);
      try {
        let finalJobDescription = values.jobDescriptionText;
        let finalResume = values.resumeText;

        if (values.inputType === 'file') {
          toast({ title: "Processing PDFs", description: "Extracting text from your files..." });
          if (values.jobDescriptionFile) {
            finalJobDescription = await extractTextFromPdf(values.jobDescriptionFile);
          }
          if (values.resumeFile) {
            finalResume = await extractTextFromPdf(values.resumeFile);
          }
        }

        // Mock API Call
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Formify Submission',
            jobDescription: finalJobDescription,
            resume: finalResume,
            processedAt: new Date().toISOString(),
          }),
        });

        const data = await response.json();
        setApiResponse(data);
        toast({
          title: "Success!",
          description: "Your data has been processed successfully.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred.",
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
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-purple-900/20 bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-headline font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Analyze Application
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Select your input method and provide the details below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-accent rounded-full" />
              Input Method
            </Label>
            <RadioGroup
              value={formik.values.inputType}
              onValueChange={(val) => formik.setFieldValue('inputType', val)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className={cn(
                "flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                formik.values.inputType === 'text' ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border hover:border-accent/50"
              )} onClick={() => formik.setFieldValue('inputType', 'text')}>
                <RadioGroupItem value="text" id="text" className="sr-only" />
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileText className={cn("w-6 h-6", formik.values.inputType === 'text' ? "text-accent" : "text-muted-foreground")} />
                  <span className="font-medium">Manual Text</span>
                </div>
              </div>

              <div className={cn(
                "flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                formik.values.inputType === 'file' ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border hover:border-accent/50"
              )} onClick={() => formik.setFieldValue('inputType', 'file')}>
                <RadioGroupItem value="file" id="file" className="sr-only" />
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className={cn("w-6 h-6", formik.values.inputType === 'file' ? "text-accent" : "text-muted-foreground")} />
                  <span className="font-medium">PDF Upload</span>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-6 transition-all duration-300">
            {formik.values.inputType === 'text' ? (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="jobDescriptionText" className="text-sm font-medium">Job Description</Label>
                  <Textarea
                    id="jobDescriptionText"
                    name="jobDescriptionText"
                    placeholder="Paste the job description here..."
                    className="min-h-[150px] bg-background/50 border-border focus:border-accent transition-colors"
                    value={formik.values.jobDescriptionText}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.jobDescriptionText && formik.touched.jobDescriptionText && (
                    <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.jobDescriptionText}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumeText" className="text-sm font-medium">Resume Content</Label>
                  <Textarea
                    id="resumeText"
                    name="resumeText"
                    placeholder="Paste your resume content here..."
                    className="min-h-[150px] bg-background/50 border-border focus:border-accent transition-colors"
                    value={formik.values.resumeText}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.resumeText && formik.touched.resumeText && (
                    <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.resumeText}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job Description PDF</Label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="jobDescriptionFile"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'jobDescriptionFile')}
                    />
                    <label
                      htmlFor="jobDescriptionFile"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                        formik.values.jobDescriptionFile ? "border-green-500 bg-green-500/5" : "border-border hover:border-accent bg-background/50"
                      )}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formik.values.jobDescriptionFile ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-xs text-green-500 font-medium">{(formik.values.jobDescriptionFile as any).name}</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-accent" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground/60">PDF only</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {formik.errors.jobDescriptionFile && (
                    <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.jobDescriptionFile as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Resume PDF</Label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="resumeFile"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'resumeFile')}
                    />
                    <label
                      htmlFor="resumeFile"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                        formik.values.resumeFile ? "border-green-500 bg-green-500/5" : "border-border hover:border-accent bg-background/50"
                      )}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formik.values.resumeFile ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-xs text-green-500 font-medium">{(formik.values.resumeFile as any).name}</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-accent" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground/60">PDF only</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {formik.errors.resumeFile && (
                    <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formik.errors.resumeFile as string}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-accent/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
            ) : (
              <><Send className="mr-2 h-5 w-5" /> Analyze Application</>
            )}
          </Button>
        </form>

        {apiResponse && (
          <div className="mt-8 p-4 rounded-xl bg-accent/10 border border-accent/20 animate-in fade-in zoom-in duration-300">
            <h3 className="text-accent font-bold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> API Response Received
            </h3>
            <pre className="text-xs text-muted-foreground overflow-auto p-2 bg-black/20 rounded-md">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
