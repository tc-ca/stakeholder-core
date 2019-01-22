using System;
using System.Collections.Generic;
using System.Linq;
using System.Resources;
using Microsoft.Xrm.Sdk;
using System.Reflection;
using System.Xml.Serialization;
using System.IO;
using Microsoft.Xrm.Sdk.Query;

namespace Core.Localization
{
    public class Connection : IPlugin
    {
        private static readonly string ROLE_1 = "record1roleid";
        private static readonly string ROLE_2 = "record2roleid";
        private static readonly string NAME = "name";

        private ITracingService tracer;
        private IPluginExecutionContext context;
        private IOrganizationService service;
        private Labels labels;
        private int lcid;

        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public Connection(string unsecureConfig, string secureConfig)
        {
            _secureConfig = secureConfig;
            _unsecureConfig = unsecureConfig;
        }
        #endregion

        public void Execute(IServiceProvider serviceProvider)
        {
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            tracer = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            service = factory.CreateOrganizationService(context.UserId);

            try
            {
                labels = new LabelFactory().BuildFromConfig(_unsecureConfig);
                lcid = (int)service.Retrieve("usersettings", context.InitiatingUserId, new ColumnSet("uilanguageid"))["uilanguageid"];

                if (context.PrimaryEntityName.Equals("connectionrole") && context.MessageName.Equals("RetrieveMultiple")) ManyRoles();
                else if (context.PrimaryEntityName.Equals("connection") && context.MessageName.Equals("Retrieve")) SingleConnection();
                else if (context.PrimaryEntityName.Equals("connection") && context.MessageName.Equals("RetrieveMultiple")) ManyConnections();
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }

        private void SingleConnection()
        {
            tracer.Trace("Checking for entity...");
            if (!context.OutputParameters.ContainsKey("BusinessEntity")) return;

            var entity = (Entity)context.OutputParameters["BusinessEntity"];
            LocalizeConnection(entity);
        }

        private void ManyConnections()
        {
            tracer.Trace("Checking for entity collection...");
            if (!context.OutputParameters.ContainsKey("BusinessEntityCollection")) return;

            var entities = (EntityCollection)context.OutputParameters["BusinessEntityCollection"];
            foreach (var entity in entities.Entities) LocalizeConnection(entity);
        }

        private void ManyRoles()
        {
            tracer.Trace("Checking for entity collection...");
            if (!context.OutputParameters.ContainsKey("BusinessEntityCollection")) return;

            var entities = (EntityCollection)context.OutputParameters["BusinessEntityCollection"];
            foreach (var entity in entities.Entities) LocalizeRole(entity);
        }

        private void LocalizeConnection(Entity entity)
        {
            tracer.Trace("Localizing connection:");
            if (entity.Contains(ROLE_1))
            {
                var role1 = entity.GetAttributeValue<EntityReference>(ROLE_1);
                tracer.Trace($"\tRole 1 (before): {role1.Name}");
                if (labels.Contains(role1.Name)) role1.Name = labels[role1.Name][lcid];
                entity[ROLE_1] = role1;
                tracer.Trace($"\tRole 1 (after): {role1.Name}");
            }

            if (entity.Contains(ROLE_2))
            {
                var role2 = entity.GetAttributeValue<EntityReference>(ROLE_2);
                tracer.Trace($"\tRole 2 (before): {role2.Name}");
                if (labels.Contains(role2.Name)) role2.Name = labels[role2.Name][lcid];
                entity[ROLE_2] = role2;
                tracer.Trace($"\tRole 2 (after): {role2.Name}");
            }
        }

        private void LocalizeRole(Entity entity)
        {
            tracer.Trace("Localizing connection role:");
            if(entity.Contains(NAME))
            {
                var name = entity.GetAttributeValue<string>(NAME);
                tracer.Trace($"\tName (before): {name}");
                if (labels.Contains(name)) name = labels[name][lcid];
                entity[NAME] = name;
                tracer.Trace($"\tName (after): {name}");
            }
        }
    }
}
