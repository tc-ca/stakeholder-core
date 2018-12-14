using Microsoft.Xrm.Sdk;
using System;
using Core.Utilities;

namespace Core.Localization
{
    public class Create : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public Create(string unsecureConfig, string secureConfig)
        {
            _secureConfig = secureConfig;
            _unsecureConfig = unsecureConfig;
        }
        #endregion

        public void Execute(IServiceProvider serviceProvider)
        {
            var tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            try
            {
                var entity = (Entity)context.InputParameters["Target"];
                var config = new Configuration(_unsecureConfig);
                var lcid = Language.GetLcid(context.InitiatingUserId, service).ToString();
                config.Write(entity);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
