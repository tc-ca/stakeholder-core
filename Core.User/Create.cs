using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Core.User
{
    public class Create : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);
            var entity = (Entity)context.InputParameters["Target"];

            try
            {
                var query = new QueryExpression("tc_ayemployee");
                query.ColumnSet = new ColumnSet("tc_domainnameid");
                query.Criteria.FilterOperator = LogicalOperator.Or;

                var domainname = (string)entity["domainname"];
                if (domainname.Contains("\\")) domainname = domainname.Substring(domainname.IndexOf('\\') + 1).ToUpper();
                query.Criteria.AddCondition(new ConditionExpression("tc_domainnameid", ConditionOperator.Equal, domainname));
                query.Criteria.AddCondition(new ConditionExpression("emailaddress", ConditionOperator.Equal, domainname));

                var employee = service.RetrieveMultiple(query).Entities.FirstOrDefault();
                if (employee == null) return;

                entity["tc_employeeid"] = new EntityReference("tc_ayemployee", employee.Id);
            }
            catch(Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
