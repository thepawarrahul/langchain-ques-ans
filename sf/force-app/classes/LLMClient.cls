public with sharing class LLMClient {
    public String callClient(String questionToAsk) {
        String url = 'https://e922-157-119-87-157.ngrok-free.app/answer';

        String jsonString = '{ "question" : "' +
            questionToAsk +'" }';

        System.debug('jsonString : '+jsonString);

        // Instantiate a new Http object
        Http h = new Http();
        // Instantiate a new HTTP request
        // Specify request properties such as the endpoint, the POST method, etc.
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(jsonString);

        // Send the request, and return a response
        HttpResponse res = h.send(req);

        System.debug('res : '+res.getBody());

        LLMClientResponse answer = (LLMClientResponse) JSON.deserialize(res.getBody(), LLMClient.LLMClientResponse.class);
        return answer.message;
    }

    public class LLMClientResponse {
        public String message { get; set; }
    }
}