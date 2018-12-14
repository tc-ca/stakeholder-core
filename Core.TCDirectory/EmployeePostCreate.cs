using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Core.TCDirectory
{
    public class EmployeePostCreate : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public EmployeePostCreate(string unsecureConfig, string secureConfig)
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
                entity = service.Retrieve(entity.LogicalName, entity.Id, new ColumnSet("tc_useraccountid"));
                if (!entity.Contains("tc_useraccountid")) return;

                var userReference = (EntityReference)entity["tc_useraccountid"];
                var user = new Entity{ LogicalName = userReference.LogicalName, Id = userReference.Id };
                user["tc_employeeid"] = entity.ToEntityReference();
                service.Update(user);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
