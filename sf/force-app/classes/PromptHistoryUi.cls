public with sharing class PromptHistoryUi {
    @AuraEnabled
    public static List<HistoryResponse> getPromptHistory() {
        List<PromptHistory__c> histories = [SELECT Id, (SELECT Id, Prompt__c, PromptResponse__c FROM Prompts__r) FROM
            PromptHistory__c];

        if (histories.isEmpty()) {
            return null;
        }

        List<HistoryResponse> responses = new List<PromptHistoryUi.HistoryResponse>();

        for (PromptHistory__c history : histories) {
            List<Prompt__c> prompts = history.Prompts__r;
            HistoryResponse response = new HistoryResponse(history.Id, prompts);

            responses.add(response);
        }

        return responses;
    }

    public class HistoryResponse {
        @AuraEnabled
        public String historyId { get; set; }

        @AuraEnabled
        public List<Prompt__c> prompts { get; set; }

        public HistoryResponse(String historyId, List<Prompt__c> prompts) {
            this.historyId = historyId;
            this.prompts = prompts;
        }

    }
}