using System;
using Microsoft.Xrm.Sdk;
using Core.Utilities;

namespace Core.Localization
{
    public class Retrieve : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public Retrieve(string unsecureConfig, string secureConfig)
        {
            _secureConfig = secureConfig;
            _unsecureConfig = unsecureConfig;
        }
        #endregion

        public void Execute(IServiceProvider serviceProvider)
        {
            var tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var service = factory.CreateOrganizationService(context.UserId);

            try
            {
                var lcid = Language.GetLcid(context.InitiatingUserId, service);
                var entity = (Entity)context.OutputParameters["BusinessEntity"];
                var config = new Configuration(_unsecureConfig);
                config.Read(entity, lcid);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
