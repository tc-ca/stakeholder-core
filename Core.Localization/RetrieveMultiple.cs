using Microsoft.Xrm.Sdk;
using System;
using Core.Utilities;

namespace Core.Localization
{
    public class RetrieveMultiple : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public RetrieveMultiple(string unsecureConfig, string secureConfig)
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
                if (!context.OutputParameters.ContainsKey("BusinessEntityCollection")) return;

                var lcid = Language.GetLcid(context.InitiatingUserId, service);
                var entities = (EntityCollection)context.OutputParameters["BusinessEntityCollection"];
                var settings = new Configuration(_unsecureConfig);
                foreach (var entity in entities.Entities)
                    settings.Read(entity, lcid);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
