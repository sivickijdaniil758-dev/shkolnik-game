import { getSubjectsForGrade, getSubjectsForGradeIntroOrder } from '../subjects'
import { loadQuestionRegistry } from './loadFromJson'

const GRADE_REGISTRY = loadQuestionRegistry()

export const MAX_GRADE = 11

export function getGradeConfig(grade) {
  return GRADE_REGISTRY[grade] ?? null
}

export function getGradeSubjects(grade, options = {}) {
  const { introOrder = false } = options
  if (introOrder) {
    return getSubjectsForGradeIntroOrder(grade)
  }
  const config = getGradeConfig(grade)
  return config?.subjects?.length ? config.subjects : getSubjectsForGrade(grade)
}

export function getQuestionsForSubject(grade, subject) {
  return getGradeConfig(grade)?.questionsBySubject?.[subject] ?? []
}

export function getFinalTestQuestions(grade) {
  return getGradeConfig(grade)?.finalQuestions ?? []
}

export function getAllRegisteredGrades() {
  return Object.keys(GRADE_REGISTRY).map(Number)
}
