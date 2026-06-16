import dataGrades1to3 from '../questions/school_game_1_3.json'
import dataGrades4to5 from '../questions/school_game_4_5.json'
import dataGrades6to7 from '../questions/school_game_6_7.json'
import dataGrades8to9 from '../questions/school_game_8_9.json'
import dataGrades10to11 from '../questions/school_game_10_11.json'

const FINAL_SUBJECT_NAME = 'Финальный тест'

const JSON_CHUNKS = [
  ...dataGrades1to3,
  ...dataGrades4to5,
  ...dataGrades6to7,
  ...dataGrades8to9,
  ...dataGrades10to11,
]

function normalizeQuestion(raw) {
  return {
    question: raw.question,
    options: [...raw.options],
    correctIndex: raw.correct,
  }
}

function buildGradeConfigFromChunks(grade, chunks) {
  const subjects = []
  const questionsBySubject = {}
  let finalQuestions = []

  for (const block of chunks) {
    if (block.subject === FINAL_SUBJECT_NAME) {
      finalQuestions = block.questions.map(normalizeQuestion)
      continue
    }

    if (!subjects.includes(block.subject)) {
      subjects.push(block.subject)
    }
    questionsBySubject[block.subject] = block.questions.map(normalizeQuestion)
  }

  return {
    grade,
    subjects,
    questionsBySubject,
    finalQuestions,
  }
}

function buildJsonRegistry() {
  const byGrade = new Map()

  for (const block of JSON_CHUNKS) {
    const grade = block.class
    if (!byGrade.has(grade)) {
      byGrade.set(grade, [])
    }
    byGrade.get(grade).push(block)
  }

  const registry = {}
  for (const [grade, chunks] of byGrade.entries()) {
    registry[grade] = buildGradeConfigFromChunks(grade, chunks)
  }
  return registry
}

export function loadQuestionRegistry() {
  return buildJsonRegistry()
}

export const JSON_GRADE_MIN = 1
export const JSON_GRADE_MAX = 11
