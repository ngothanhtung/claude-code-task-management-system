/**
 * Seed script cho Firestore collection "questions"
 * 10 câu hỏi tiếng Anh chủ đề ANIMALS
 *
 * Gọi seedQuestionsMockData() từ UI để push lên Firestore.
 */

import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Question } from "@/types/quiz";

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    content: "What is the English word for 'con chó'?",
    option1: "Cat",
    option2: "Dog",
    option3: "Bird",
    option4: "Fish",
    correctOption: "option2",
  },
  {
    id: 2,
    content: "Which animal is known as the 'King of the Jungle'?",
    option1: "Tiger",
    option2: "Bear",
    option3: "Lion",
    option4: "Wolf",
    correctOption: "option3",
  },
  {
    id: 3,
    content: "What does the word 'Elephant' mean in Vietnamese?",
    option1: "Con hươu",
    option2: "Con voi",
    option3: "Con ngựa",
    option4: "Con gấu",
    correctOption: "option2",
  },
  {
    id: 4,
    content: "Which of the following is a reptile?",
    option1: "Dolphin",
    option2: "Eagle",
    option3: "Crocodile",
    option4: "Rabbit",
    correctOption: "option3",
  },
  {
    id: 5,
    content: "What is the English word for 'con bướm'?",
    option1: "Bee",
    option2: "Dragonfly",
    option3: "Ant",
    option4: "Butterfly",
    correctOption: "option4",
  },
  {
    id: 6,
    content: "Which animal can live both in water and on land?",
    option1: "Snake",
    option2: "Frog",
    option3: "Monkey",
    option4: "Parrot",
    correctOption: "option2",
  },
  {
    id: 7,
    content: "What is the English word for 'con cá mập'?",
    option1: "Whale",
    option2: "Octopus",
    option3: "Shark",
    option4: "Seal",
    correctOption: "option3",
  },
  {
    id: 8,
    content: "Which animal is famous for storing water in its hump?",
    option1: "Giraffe",
    option2: "Camel",
    option3: "Hippo",
    option4: "Rhino",
    correctOption: "option2",
  },
  {
    id: 9,
    content: "What is the English word for 'con chim cánh cụt'?",
    option1: "Pelican",
    option2: "Flamingo",
    option3: "Penguin",
    option4: "Parrot",
    correctOption: "option3",
  },
  {
    id: 10,
    content: "Which of the following is NOT a mammal?",
    option1: "Bat",
    option2: "Whale",
    option3: "Salmon",
    option4: "Dolphin",
    correctOption: "option3",
  },
];

export async function seedQuestionsMockData(): Promise<void> {
  const questionsRef = collection(db, "questions");

  const promises = MOCK_QUESTIONS.map((q) =>
    setDoc(doc(questionsRef, String(q.id)), {
      id: q.id,
      content: q.content,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correctOption: q.correctOption,
    })
  );

  await Promise.all(promises);
  console.log("✅ Mock questions seeded successfully!");
}
