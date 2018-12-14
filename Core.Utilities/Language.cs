using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Core.Utilities
{
    public static class Language
    {
        public static int GetLcid(Guid userId, IOrganizationService service)
        {
            var query = new QueryExpression
            {
                EntityName = "usersettings",
                ColumnSet = new ColumnSet("uilanguageid", "systemuserid")
            };
            query.Criteria.AddCondition(new ConditionExpression
            {
                EntityName = "usersettings",
                AttributeName = "systemuserid",
                Values = { userId },
                Operator = ConditionOperator.Equal
            });
            var results = service.RetrieveMultiple(query).Entities;
            if (results.Count == 0) throw new InvalidPluginExecutionException("Invalid executing user");

            return (int)results[0]["uilanguageid"];
        }
    }
}
