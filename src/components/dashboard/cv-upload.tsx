"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CvUploadProps = {
  name: string;
  files: File[];
  setFiles: (files: File[]) => void;
};

export default function CvUpload({ name, files, setFiles }: CvUploadProps) {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files, setFiles]);

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  return (
    <div>
        {/* This is a hidden input to make react-hook-form aware of the files */}
        {files.map((file, index) => (
            <input
            key={index}
            type="file"
            name={`${name}`}
            style={{ display: 'none' }}
            // The following is a trick to associate File object with the input
            ref={input => {
                if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                }
            }}
            readOnly
            />
        ))}

      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 text-muted-foreground" />
        <p className="mt-4 text-lg text-center text-muted-foreground">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop CVs here, or click to select files'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">(PDF or Word documents)</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium">Uploaded Files:</h4>
          <ul className="mt-2 space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary-foreground" />
                  <span className="text-sm font-medium text-secondary-foreground">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(file)} className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
