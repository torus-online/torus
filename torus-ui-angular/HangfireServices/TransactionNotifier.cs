using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Nethereum.Web3;
using RestSharp;
using RestSharp.Authenticators;

namespace torus_ui_angular.HangfireServices
{
    public enum TransactionNotification
    {
        ContractDeployment,
        SharesSend,
    }

    public class TransactionNotifier
    {
        public TransactionNotifier(IConfiguration config)
        {
            _config = config;
        }

        private IConfiguration _config;

        public async Task NotifyWhenCompleteAsync(string transactionHash, string email, TransactionNotification notification)
        {
            var web3 = new Web3("https://ropsten.infura.io/v3/913e53891f9b4a6d84c1046d2f3ab0ad");
            var receipt = await web3.Eth.TransactionManager.TransactionReceiptService.PollForReceiptAsync(transactionHash);
            Console.WriteLine(receipt.ContractAddress);

            RestClient client = new RestClient();
            client.BaseUrl = new Uri("https://api.mailgun.net/v3");
            client.Authenticator = new HttpBasicAuthenticator("api", _config.GetSection("Mailgun")["ApiKey"]);
            RestRequest request = new RestRequest();
            request.AddParameter("domain", "mg.torus.onl", ParameterType.UrlSegment);
            request.Resource = "{domain}/messages";
            request.AddParameter("from", "Torus Notifications <notifications@mg.torus.onl>");
            request.AddParameter("to", email);
            
            switch (notification)
            {
                case TransactionNotification.ContractDeployment:
                    request.AddParameter("subject", "Your organization on Torus is ready");
                    request.AddParameter("text", $"Deploy completed. This copy sucks. " +
                        $"Contract ID: {receipt.ContractAddress} at https://torus-ui.azurewebsites.net/{receipt.ContractAddress}");
                    break;
                case TransactionNotification.SharesSend:
                    request.AddParameter("subject", "Your shares have on Torus have been sent");
                    request.AddParameter("text", $"Shares sent. This copy sucks. " +
                        $"Transaction hash: {receipt.TransactionHash}.");
                    break;
                default:
                throw new InvalidOperationException(
                    $"Unexpected [{nameof(notification)}] value: '{notification}'.");
            }
            
            request.Method = Method.POST;
            var response = await client.ExecuteAsync(request);
        }
    }
}