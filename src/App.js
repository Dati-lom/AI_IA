import React, { Fragment, useState, useContext, useEffect } from "react";
import emailjs from 'emailjs-com'; // Import EmailJS SDK
import { renderHTML, scrollToElem, handleChosenAnswer } from "./utilities";
import { Store, useAppContext } from "./AppContext";
import "./styles.css";
import dataEN from "./dataEN.json";
import dataGE from "./dataGE.json";

// Translation object
const translations = {
  EN: {
    start:"Start",
    never: "Never applies to me",
    sometimes: "Sometimes applies to me",
    often: "Often applies to me",
    next: "Next",
    prev: "Prev",
    submit: "Submit",
    assessmentTitle: "Learning Style Assessment",
    assessmentSubtitle: "How do these statements apply to you?",
    wellDone: "Well done!",
    sectionScores: "Scores for each section:",
    sectionOne: "Section One (Visual)",
    sectionTwo: "Section Two (Auditory)",
    sectionThree: "Section Three (Kinesthetic)",
    emailSuccess: "Email sent successfully!",
    incompleteMessage: "Oops, looks like you haven't answered all the questions",
    scrollMessage: "Scroll up to see which questions you've missed out on.",
    finish: "Finish"
  },
  GE: {
    start:"დაწყება",
    never: "არ ვრცელდება ჩემზე",
    sometimes: "ხანდახან ვრცელდება ჩემზე",
    often: "ხშირად ვრცელდება ჩემზე",
    next: "შემდეგი",
    prev: "წინა",
    submit: "გაგზავნა",
    assessmentTitle: "სწავლის სტილის განსაზღვრა",
    assessmentSubtitle: "გაიგე რომელი ხარ შენ",
    wellDone: "გილოცავ!",
    sectionScores: "სექციების ქულები:",
    sectionOne: "სექცია ერთი (ვიზუალური)",
    sectionTwo: "სექცია ორი (სმენითი)",
    sectionThree: "სექცია სამი (კინესთეტიკური)",
    emailSuccess: "ელფოსტა წარმატებით გაიგზავნა!",
    incompleteMessage: "უი, როგორც ჩანს, ყველა კითხვას არ უპასუხეთ",
    scrollMessage: "დაამატეთ ზემოთ, რომ ნახოთ რომელი კითხვები დაგავიწყდათ.",
    finish: "დასრულება"
  }
};

const answerScores = {
  0: 1, // Never applies to me
  1: 2, // Sometimes applies to me
  2: 3  // Often applies to me
};
const totalQuestions = 30;

export default function App() {
  const [chosenAnswers, setChosenAnswers] = useState(new Array(totalQuestions));
  const [emailSent, setEmailSent] = useState(false);
  const [language, setLanguage] = useState('GE'); // State for selected language
  const [data, setData] = useState(dataGE);

  useEffect(() => {
    setData(language === 'EN' ? dataEN : dataGE);
  }, [language]);

  function renderQuestions() {
    return data.results.map((result, index) => (
      <Question key={index} result={result} index={index} language={language} handleSubmit={()=>handleSubmit()} />
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

  // Function to find the first unanswered question
  function findFirstUnansweredQuestion() {
    
    
    return chosenAnswers.findIndex(answer => answer === undefined);
  }

  // Define handleSubmit function
  function handleSubmit() {
    const firstUnansweredIndex = findFirstUnansweredQuestion();
    
    if (firstUnansweredIndex !== -1) {
      
      scrollToElem(`question-${firstUnansweredIndex}`);
      return; // Prevent submission
    }

    const scores = calculateSectionScores();
    scrollToElem(`finish`);

    
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
      <Start setLanguage={setLanguage} language={language} />
      {renderQuestions()}
      <Finish calculateSectionScores={calculateSectionScores} handleSubmit={handleSubmit} emailSent={emailSent} language={language} />
    </Store.Provider>
  );
}

export function Question({ result, index, language,handleSubmit }) {
  return (
    <section id={`question-${index}`} className="fullpage-center">
      <h3>
        {index + 1}. {renderHTML(result.question)}
      </h3>
      <div className="answers">
        <Answers result={result} parentIndex={index} language={language} />
      </div>
      <section className="btn-group" style={{ display: "flex" }}>
        {index !== 0 && (
          <Button
            text={translations[language].prev}
            func={() => scrollToElem(`question-${index - 1}`)}
          />
        )}
        {index !== totalQuestions - 1 && (
          <Button
            text={translations[language].next}
            func={() => scrollToElem(`question-${index + 1}`)}
          />
        )}
        {index === totalQuestions - 1 && (
          <Button text={translations[language].finish} func={() => handleSubmit()} />
        )}
      </section>
    </section>
  );
}

export function Answers({ result, parentIndex, language }) {
  const answerOptions = [
    translations[language].never,
    translations[language].sometimes,
    translations[language].often
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

function Start({ setLanguage, language }) {
  return (
    <section className="fullpage-center" id="start">
      <h1>{translations[language].assessmentTitle}</h1>
      <h2>{translations[language].assessmentSubtitle}</h2>
      {/* Add start-button class */}
      <Button text={translations[language].start} func={() => scrollToElem("question-0")} className="start-button" />
      {/* Add language-switch class */}
      <div className="language-switch">
        <button onClick={() => setLanguage('EN')} disabled={language === 'EN'}>English</button>
        <button onClick={() => setLanguage('GE')} disabled={language === 'GE'}>Georgian</button>
      </div>
    </section>
  );
}


function Finish({ calculateSectionScores, handleSubmit, emailSent, language }) {
  const { chosenAnswers } = useContext(Store);
  const scores = calculateSectionScores();
  const textCompleted = (
    <Fragment key="finish">
      <h3>{translations[language].wellDone}</h3>
      <h4>{translations[language].sectionScores}</h4>
      <p>{translations[language].sectionOne}: {scores.SECTION_ONE}</p>
      <p>{translations[language].sectionTwo}: {scores.SECTION_TWO}</p>
      <p>{translations[language].sectionThree}: {scores.SECTION_THREE}</p>
      {emailSent && <p>{translations[language].emailSuccess}</p>}
    </Fragment>
  );

  const textIncomplete = (
    <Fragment>
      <h4>{translations[language].incompleteMessage}</h4>
      <p>{translations[language].scrollMessage}</p>
    </Fragment>
  );

  const answeredQuestions = chosenAnswers.filter(ar => ar !== undefined).length;

  return (
    <section className="fullpage-center" id="finish">
      {answeredQuestions === totalQuestions ? textCompleted : textIncomplete}
    </section>
  );
}
