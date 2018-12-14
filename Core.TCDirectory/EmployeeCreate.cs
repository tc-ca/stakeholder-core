using System;
using System.Linq;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Core.TCDirectory
{
    public class EmployeeCreate : IPlugin
    {
        private string serviceUrl = PluginSettings.ServiceUrl;

        public void Execute(IServiceProvider serviceProvider)
        {
            var tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);
            var entity = (Entity)context.InputParameters["Target"];

            try
            {
                var query = new QueryExpression("systemuser");
                query.ColumnSet = new ColumnSet("domainname");
                query.Criteria.FilterOperator = LogicalOperator.Or;
                if(entity.Contains("emailaddress"))
                    query.Criteria.AddCondition(new ConditionExpression("domainname", ConditionOperator.Equal, entity["emailaddress"]));
                if (entity.Contains("tc_domainnameid"))
                    query.Criteria.AddCondition(new ConditionExpression("domainname", ConditionOperator.EndsWith, entity["tc_domainnameid"]));

                var user = service.RetrieveMultiple(query).Entities.FirstOrDefault();
                if (user == null) return;

                entity["tc_useraccountid"] = new EntityReference("systemuser", user.Id);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
