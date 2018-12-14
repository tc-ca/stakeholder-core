using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Core.Localization
{
    public class Update : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public Update(string unsecureConfig, string secureConfig)
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

            if (context.Depth > 1) return;

            try
            {
                var entity = (Entity)context.InputParameters["Target"];
                var settings = new Configuration(_unsecureConfig);
                var savedEntity = service.Retrieve(entity.LogicalName, entity.Id, new ColumnSet(settings.Columns));

                foreach (var attribute in savedEntity.Attributes)
                {
                    if (entity.Contains(attribute.Key)) continue;
                    entity[attribute.Key] = savedEntity[attribute.Key];
                }

                settings.Write(entity);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
