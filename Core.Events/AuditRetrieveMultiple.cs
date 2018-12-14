using System;
using System.Linq;
using Core.Utilities;
using Microsoft.Xrm.Sdk;

namespace Core.Events
{
    public class AuditRetrieveMultiple : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public AuditRetrieveMultiple(string unsecureConfig, string secureConfig)
        {
            _secureConfig = secureConfig;
            _unsecureConfig = unsecureConfig;
        }
        #endregion

        private static readonly Guid typeId = new Guid("57621AA5-9FEC-E611-8132-000C2958E3A5");

        public void Execute(IServiceProvider serviceProvider)
        {
            var tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            try
            {
                var settings = new LanguageSettings(_unsecureConfig);
                var entities = (EntityCollection)context.OutputParameters["BusinessEntityCollection"];

                var log = new Entity("tc_dyeventlog");
                log["tc_eventenm"] = "Retrieve collection";
                log["tc_eventfnm"] = "Retrouver collection";
                log["tc_typeid"] = new EntityReference { LogicalName = "tc_tyeventtype", Id = typeId };
                var id = service.Create(log);

                foreach (var value in settings.Values)
                {
                    service.Associate(
                        log.LogicalName,
                        id,
                        new Relationship(value["relationship"]),
                        new EntityReferenceCollection(entities.Entities.Select(x => x.ToEntityReference()).ToList())
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
