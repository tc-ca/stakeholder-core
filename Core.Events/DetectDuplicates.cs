using Core.Utilities;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Core.Events
{
    public class DetectDuplicates : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public DetectDuplicates(string unsecureConfig, string secureConfig)
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
                var entity = (Entity)context.InputParameters["Target"];
                var lcid = Language.GetLcid(context.InitiatingUserId, service);
                var request = new RetrieveDuplicatesRequest();
                request.BusinessEntity = entity;
                request.PagingInfo = new PagingInfo();
                request.MatchingEntityName = entity.LogicalName;
                var duplicates = ((RetrieveDuplicatesResponse)service.Execute(request)).DuplicateCollection.Entities;
                if (duplicates.Count != 0)
                {
                    var link = string.Format("<a href=\"/{0}/main.aspx?etn={1}&id=%7b{2}%7d&pagetype=entityrecord\" target=\"_new\">{3}</a>", 
                        context.OrganizationName, 
                        entity.LogicalName, 
                        duplicates[0].Id, 
                        lcid == 1033 ? "open" : "ouvert");
                    throw new Exception(lcid == 1033 ? "Duplicate of an existing record: " + link : "Double d'un enregistrement existant: " + link);
                }
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
