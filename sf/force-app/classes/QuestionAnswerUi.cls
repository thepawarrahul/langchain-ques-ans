public with sharing class QuestionAnswerUi {
    @AuraEnabled
    public static PromptResponse queryAnswer(String promptHistoryId, String question) {
        // We cannot do DML before callout so doing DML after.
        String answer = new LLMClient().callClient(question);

        if (promptHistoryId == null) {
            promptHistoryId = insertPromptHistoryAndReturnId();
        }

        createPromptRecord(promptHistoryId, question, answer);
        return new PromptResponse(promptHistoryId, answer);
    }

    private static Id insertPromptHistoryAndReturnId() {
        PromptHistory__c history = new PromptHistory__c();
        insert history;

        return history.Id;
    }

    private static void createPromptRecord(String promptHistoryId,
        String question, String answer) {
        // create Prompt record and link it to the promptHistory.
        Prompt__c promptRecord = new Prompt__c();
        promptRecord.Prompt__c = question;
        promptRecord.PromptResponse__c = answer;
        promptRecord.PromptHistory__c = promptHistoryId;

        insert promptRecord;
    }

    public class PromptResponse {
        @AuraEnabled
        public String promptHistoryId { get; set; }

        @AuraEnabled
        public String promptResponse { get; set; }

        public PromptResponse(String promptHistoryId, String promptResponse) {
            this.promptHistoryId = promptHistoryId;
            this.promptResponse = promptResponse;
        }
    }
}