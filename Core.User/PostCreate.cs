using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Core.User
{
    public class PostCreate : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public PostCreate(string unsecureConfig, string secureConfig)
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
            var entity = (Entity)context.InputParameters["Target"];

            try
            {
                entity = service.Retrieve(entity.LogicalName, entity.Id, new ColumnSet("tc_employeeid"));
                if (!entity.Contains("tc_employeeid")) return;

                var employeeReference = (EntityReference)entity["tc_employeeid"];
                var employee = new Entity{ LogicalName = employeeReference.LogicalName, Id = employeeReference.Id};
                employee["tc_useraccountid"] = entity.ToEntityReference();
                service.Update(employee);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
