using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Core.Project
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
                var projectType= entity["tc_projecttypeid"] as EntityReference;

                //get list of questions and loop through to create answers for the new project
                var query = new QueryExpression("tc_tyquestion");
                query.Criteria.AddCondition("tc_projecttypeid", ConditionOperator.Equal, projectType.Id);
                query.ColumnSet = new ColumnSet(true);
                var questions = service.RetrieveMultiple(query);
                if (questions.Entities.Count <= 0) return;
                
                foreach (var item in questions.Entities)
                {
                    var answer = new Entity("tc_myanswer");
                    answer["tc_questionid"] = item.ToEntityReference();
                    answer["tc_projectid"] = entity.ToEntityReference();
                    service.Create(answer);
                }
                
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
