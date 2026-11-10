/** Общие константы и оценки; контент классов — в data/grades/ */
export {
  getGradeConfig,
  getGradeSubjects,
  getQuestionsForSubject,
  getFinalTestQuestions,
  getAllRegisteredGrades,
  MAX_GRADE,
} from './grades/index'

export {
  getNewSubjectsForGrade,
  getSubjectsForGrade,
  NEW_SUBJECT_DESCRIPTIONS,
} from './subjects'

export const SUBJECTS = ['Математика', 'Русский язык', 'Литература', 'Окружающий мир']
/** @deprecated Используйте getQuestionsForSubject(grade, subject).length */
export const QUESTIONS_PER_SUBJECT = 10
/** @deprecated Используйте getFinalTestQuestions(grade).length */
export const FINAL_TEST_QUESTIONS = 5
export const MAX_ATTEMPTS = 3
export const FINAL_TEST_MAX_ATTEMPTS = 3

export const DIFFICULTY_OPTIONS = {
  easy: { label: 'Лёгкая', seconds: 30 },
  normal: { label: 'Средняя', seconds: 20 },
  hard: { label: 'Сложная', seconds: 10 },
}

export { getFinalMarkByMistakes, getMarkByMistakes } from '../utils/grading'
