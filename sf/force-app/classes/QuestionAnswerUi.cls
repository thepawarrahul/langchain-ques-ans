public with sharing class QuestionAnswerUi {
    @AuraEnabled
    public static String queryAnswer(String question) {
        String answer = new LLMClient().callClient(question);
        return answer;
    }
}