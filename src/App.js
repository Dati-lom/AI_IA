import React, { Fragment, useState, useContext } from "react";
import emailjs from 'emailjs-com'; // Import EmailJS SDK
import { renderHTML, scrollToElem, handleChosenAnswer } from "./utilities";
import { Store, useAppContext } from "./AppContext";
import "./styles.css";
import data from "./data.json";

const answerScores = {
  0: 1, // Never applies to me
  1: 2, // Sometimes applies to me
  2: 3  // Often applies to me
};

const sections = {
  SECTION_ONE: 0,
  SECTION_TWO: 10,
  SECTION_THREE: 20
};

const totalQuestions = data.results.length;

export default function App() {
  const [chosenAnswers, setChosenAnswers] = useState([]);
  const [emailSent, setEmailSent] = useState(false);

  function renderQuestions() {
    return data.results.map((result, index) => (
      <Question key={index} result={result} index={index} />
    ));
  }

  function calculateSectionScores() {
    const scores = { SECTION_ONE: 0, SECTION_TWO: 0, SECTION_THREE: 0 };
    chosenAnswers.forEach((answer, index) => {
      if (answer !== undefined) {
        let section;
        if (index < 10) section = "SECTION_ONE";
        else if (index < 20) section = "SECTION_TWO";
        else section = "SECTION_THREE";

        scores[section] += answerScores[answer];
      }
    });

    return scores;
  }

  function handleSubmit() {
    const scores = calculateSectionScores();

    // EmailJS configuration
    emailjs.send('service_9pcguwq', 'template_hre42w5', {
      to_name: 'AIIA',
      from_name: 'AIIA',
      section_one_score: scores.SECTION_ONE,
      section_two_score: scores.SECTION_TWO,
      section_three_score: scores.SECTION_THREE,
      message: 'Here are the scores from the learning style assessment.'
    }, 'Xkh4Njd3bXlpxURCE')
    .then(response => {
      console.log('Success:', response);
      setEmailSent(true);
    })
    .catch(error => {
      console.error('Error:', error);
      setEmailSent(false);
    });
  }

  return (
    <Store.Provider value={{ chosenAnswers, setChosenAnswers }}>
      <Start />
      {renderQuestions()}
      <Finish calculateSectionScores={calculateSectionScores} handleSubmit={handleSubmit} emailSent={emailSent} />
    </Store.Provider>
  );
}

export function Question({ result, index }) {
  return (
    <section id={`question-${index}`} className="fullpage-center">
      <h3>
        {index + 1}. {renderHTML(result.question)}
      </h3>
      <div className="answers">
        <Answers result={result} parentIndex={index} />
      </div>
      <section className="btn-group" style={{ display: "flex" }}>
        {index !== 0 && (
          <Button
            text="prev"
            func={() => scrollToElem(`question-${index - 1}`)}
          />
        )}
        {index !== totalQuestions - 1 && (
          <Button
            text="next"
            func={() => scrollToElem(`question-${index + 1}`)}
          />
        )}
        {index === totalQuestions - 1 && (
          <Button text="finish" func={() => scrollToElem("finish")} />
        )}
      </section>
    </section>
  );
}

export function Answers({ result, parentIndex }) {
  const answerOptions = [
    "Never applies to me",
    "Sometimes applies to me",
    "Often applies to me"
  ];

  return answerOptions.map((answer, index) => (
    <Answer
      key={index}
      answer={answer}
      index={index}
      parentIndex={parentIndex}
    />
  ));
}

function Answer({ answer, index, parentIndex }) {
  const { chosenAnswers, setChosenAnswers } = useAppContext();
  return (
    <Fragment>
      <input
        type="radio"
        name={`question-${parentIndex}`}
        onChange={element =>
          setChosenAnswers(
            handleChosenAnswer(element, parentIndex, chosenAnswers)
          )
        }
        value={index}
      />
      {renderHTML(answer)}
      <br />
    </Fragment>
  );
}

function Button({ text, func }) {
  return (
    <button type="button" onClick={func}>
      {text}
    </button>
  );
}

function Start() {
  return (
    <section className="fullpage-center" id="start">
      <h1>Learning Style Assessment</h1>
      <h2>How do these statements apply to you?</h2>
      <Button text="Let's go!" func={() => scrollToElem("question-0")} />
    </section>
  );
}

function Finish({ calculateSectionScores, handleSubmit, emailSent }) {
  const { chosenAnswers } = useContext(Store);
  const scores = calculateSectionScores();
  const textCompleted = (
    <Fragment>
      <h3>Well done!</h3>
      <h4>Scores for each section:</h4>
      <p>Section One (Visual): {scores.SECTION_ONE}</p>
      <p>Section Two (Auditory): {scores.SECTION_TWO}</p>
      <p>Section Three (Kinesthetic): {scores.SECTION_THREE}</p>
      <Button text="Submit Scores" func={handleSubmit} />
      {emailSent && <p>Email sent successfully!</p>}
    </Fragment>
  );

  const textIncomplete = (
    <Fragment>
      <h4>Oops, looks like you haven't answered all the questions</h4>
      <p>Scroll up to see which questions you've missed out on.</p>
    </Fragment>
  );

  const answeredQuestions = chosenAnswers.filter(ar => ar !== undefined).length;

  return (
    <section className="fullpage-center" id="finish">
      {answeredQuestions === totalQuestions ? textCompleted : textIncomplete}
    </section>
  );
}
