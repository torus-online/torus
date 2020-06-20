using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using torus_ui_angular.HangfireServices;

namespace torus_ui_angular.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EthController : ControllerBase
    {
        public EthController(
            IConfiguration config,
            ILogger<FeatureFlagsController> logger)
        {
            _config = config;
            _logger = logger;
        }

        private readonly IConfiguration _config;
        private readonly ILogger<FeatureFlagsController> _logger;

        [HttpPost("notify-complete")]
        [ProducesResponseType(202)]
        [ProducesResponseType(400)]
        public IActionResult PostNotifyComplete(PostNotifyCompleteModel model)
        {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            BackgroundJob.Enqueue<TransactionNotifier>(t =>
                t.NotifyWhenCompleteAsync(model.TransactionHash, model.Email, Enum.Parse<TransactionNotification>(model.Notification, true)));

            return Accepted();
        }
    }
}