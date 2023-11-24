import { LightningElement } from 'lwc';
import queryAnswer from  '@salesforce/apex/QuestionAnswerUi.queryAnswer';

export default class GptQuestionAnswer extends LightningElement {
  answer;

  handleAskClick(event) {
    let query = this.template.querySelector('lightning-input').value;

    queryAnswer({ question: query })
    .then(result => {
      this.answer = result;
    })
    .catch(error => {
      console.error(error);
    });
  }
}