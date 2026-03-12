  const lessons = ["Lesson 1", "Lesson 2", "Lesson 3"];
  const completedLessons = lessons.map(lesson => false);

  function completeLesson(lessonIndex) {
    completedLessons[lessonIndex] = true;
    console.log(`Completed: ${lessons[lessonIndex]}`);
  }

  const quizQuestions = ["Q1", "Q2", "Q3"];
  const answeredQuestions = quizQuestions.map(q => null);

  function submitAnswer(qIndex, ans) {
    answeredQuestions[qIndex] = ans;
    console.log(`Answered ${quizQuestions[qIndex]}: ${ans}`);
  }

  let studyTime = 1500; // 25 minutes
  const timer = setInterval(() => {
    studyTime--;
    if (studyTime % 60 === 0) {
      console.log(`Study session: ${Math.floor(studyTime/60)} minutes left`);
    }
    if (studyTime <= 0) clearInterval(timer);
  }, 1000);
