using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace torus_ui_angular.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FeatureFlagsController : ControllerBase
    {
        public FeatureFlagsController(
            IConfiguration config,
            ILogger<FeatureFlagsController> logger)
        {
            _config = config;
            _logger = logger;
        }

        private readonly IConfiguration _config;
        private readonly ILogger<FeatureFlagsController> _logger;

        [HttpGet]
        [ProducesResponseType(200)]
        [Produces("application/json")]
        public IActionResult Get()
        {
            return Ok(_config["FeatureFlags"]);
        }
    }
}