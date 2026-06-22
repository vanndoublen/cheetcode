import { Language, SubmissionStatus } from "@/generated/prisma/enums";
import { BundledLanguage } from "shiki/types";

export function getLanguageDisplayName(language: Language): string {
  const map: Record<Language, string> = {
    CPP:        'C++',
    JAVA:       'Java',
    PYTHON:     'Python',
    PYTHON3:    'Python 3',
    JAVASCRIPT: 'JavaScript',
    TYPESCRIPT: 'TypeScript',
    GO:         'Go',
    RUST:       'Rust',
    C:          'C',
    CSHARP:     'C#',
    MYSQL:      'MySQL',
    MSSQL:      'MS SQL',
    ORACLESQL:  'Oracle SQL',
    POSTGRESQL: 'PostgreSQL',
    PYTHONDATA: 'Python (Data)',
  };

  return map[language];
}

export function getSubmissionStatusDisplayName(status: SubmissionStatus): string {
  const map: Record<SubmissionStatus, string> = {
    PENDING:              'Pending',
    RUNNING:              'Running',
    ACCEPTED:             'Accepted',
    WRONG_ANSWER:         'Wrong Answer',
    TIME_LIMIT_EXCEEDED:  'Time Limit Exceeded',
    MEMORY_LIMIT_EXCEEDED:'Memory Limit Exceeded',
    RUNTIME_ERROR:        'Runtime Error',
    COMPILE_ERROR:        'Compile Error',
  };

  return map[status];
}

// --- Shiki Language Mapping ---

export function getShikiLanguage(language: Language): BundledLanguage {
  const map: Record<Language, BundledLanguage> = {
    CPP:        'cpp',
    JAVA:       'java',
    PYTHON:     'python',
    PYTHON3:    'python',
    JAVASCRIPT: 'javascript',
    TYPESCRIPT: 'typescript',
    GO:         'go',
    RUST:       'rust',
    C:          'c',
    CSHARP:     'csharp',
    MYSQL:      'sql',
    MSSQL:      'sql',
    ORACLESQL:  'sql',
    POSTGRESQL: 'sql',
    PYTHONDATA: 'python',
  };

  return map[language];
}