using System;
using Core.Utilities;
using Microsoft.Xrm.Sdk;

namespace Core.Events
{
    public class AuditRetrieve : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public AuditRetrieve(string unsecureConfig, string secureConfig)
        {
            _secureConfig = secureConfig;
            _unsecureConfig = unsecureConfig;
        }
        #endregion

        private static readonly Guid typeId = new Guid("832CAC8F-9FEC-E611-8132-000C2958E3A5");

        public void Execute(IServiceProvider serviceProvider)
        {
            var tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            try
            {
                var settings = new LanguageSettings(_unsecureConfig);
                var entity = (Entity)context.OutputParameters["BusinessEntity"];

                var log = new Entity("tc_dyeventlog");
                log["tc_eventenm"] = "Retrieve";
                log["tc_eventfnm"] = "Retrouver";
                log["tc_typeid"] = new EntityReference { LogicalName = "tc_tyeventtype", Id = typeId };
                var id = service.Create(log);

                foreach (var value in settings.Values)
                {
                    service.Associate(
                        log.LogicalName,
                        id,
                        new Relationship(value["relationship"]),
                        new EntityReferenceCollection(new[] { entity.ToEntityReference() })
                    );
                }
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
