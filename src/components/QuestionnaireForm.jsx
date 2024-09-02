// src/components/QuestionnaireForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const QuestionnaireForm = () => {
  const { register, handleSubmit, watch } = useForm();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const sections = [
    {
      title: 'SECTION ONE',
      questions: [
        "I enjoy doodling and even my notes have lots of pictures and arrows in them.",
        "I remember something better if I write it down.",
        "I get lost or am late if someone tells me how to get to a new place, and I don’t write down the directions.",
        "When trying to remember someone’s telephone number, or something new like that, it helps me to get a picture of it in my mind.",
        "If I am taking a test, I can “see” the textbook page and where the answer is located.",
        "It helps me to look at the person while listening; it keeps me focused.",
        "Using flashcards helps me to retain material for tests.",
        "It’s hard for me to understand what a person is saying when there are people talking or music playing.",
        "It’s hard for me to understand a joke when someone tells me.",
        "It is better for me to get work done in a quiet place."
      ]
    },
    {
      title: 'SECTION TWO',
      questions: [
        "My written work doesn’t look neat to me. My papers have crossed-out words and erasures.",
        "It helps to use my finger as a pointer when reading to keep my place.",
        "Papers with very small print, blotchy dittos or poor copies are tough on me.",
        "I understand how to do something if someone tells me, rather than having to read the same thing to myself.",
        "I remember things that I hear, rather than things that I see or read.",
        "Writing is tiring. I press down too hard with my pen or pencil.",
        "My eyes get tired fast, even though the eye doctor says that my eyes are ok.",
        "When I read, I mix up words that look alike, such as “them” and “then,” “bad” and “dad.”",
        "It’s hard for me to read other people’s handwriting.",
        "If I had the choice to learn new information through a lecture or textbook, I would choose to hear it rather than read it."
      ]
    },
    {
      title: 'SECTION THREE',
      questions: [
        "I don’t like to read directions; I’d rather just start doing.",
        "I learn best when I am shown how to do something, and I have the opportunity to do it.",
        "Studying at a desk is not for me.",
        "I tend to solve problems through a more trial-and-error approach, rather than from a step-by-step method.",
        "Before I follow directions, it helps me to see someone else do it first.",
        "I find myself needing frequent breaks while studying.",
        "I am not skilled in giving verbal explanations or directions.",
        "I do not become easily lost, even in strange surroundings.",
        "I think better when I have the freedom to move around.",
        "When I can’t think of a specific word, I’ll use my hands a lot and call something a “what-cha-ma-call-it” or a “thing-a-ma-jig.”"
      ]
    }
  ];

  const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0);
  const currentSection = sections.find(section => currentQuestion < section.questions.length);
  const questionIndex = currentSection ? currentSection.questions.findIndex((_, i) => i === currentQuestion) : -1;
  const questionText = currentSection ? currentSection.questions[questionIndex] : null;

  const onNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const onPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const onSubmit = (data) => {
    console.log(data);
    // Handle final submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {questionText && (
        <div className="card">
          <h2>{currentSection.title}</h2>
          <p>{questionText}</p>
          <div>
            <input type="radio" {...register(`question_${currentQuestion}`)} value="1" /> Never applies to me.
            <input type="radio" {...register(`question_${currentQuestion}`)} value="2" /> Sometimes applies to me.
            <input type="radio" {...register(`question_${currentQuestion}`)} value="3" /> Often applies to me.
          </div>
          <div className="navigation-buttons">
            {currentQuestion > 0 && <button type="button" onClick={onPrevious}>Previous</button>}
            {currentQuestion < totalQuestions - 1
              ? <button type="button" onClick={onNext}>Next</button>
              : <button type="submit">Submit</button>}
          </div>
        </div>
      )}
    </form>
  );
};

export default QuestionnaireForm;
