using System;
using System.Collections.Generic;
using System.Linq;
using System.Resources;
using Microsoft.Xrm.Sdk;
using Core.Utilities;
using System.Reflection;
using System.Xml.Serialization;
using System.IO;

namespace Core.Localization
{
    public class Connection : IPlugin
    {
        private static readonly string ROLE_1 = "record1roleid";
        private static readonly string ROLE_2 = "record2roleid";
        private static readonly string NAME = "name";
        private static Labels labels;

        private ITracingService tracer;
        private IPluginExecutionContext context;
        private IOrganizationService service;
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
                var serializer = new XmlSerializer(typeof(Labels));
                using (var reader = new StringReader(_unsecureConfig))
                {
                    labels = serializer.Deserialize(reader) as Labels;
                }

                lcid = Language.GetLcid(context.InitiatingUserId, service);

                if (context.PrimaryEntityName.Equals("connectionrole") && context.MessageName.Equals("Retrieve")) SingleRole();
                else if (context.PrimaryEntityName.Equals("connectionrole") && context.MessageName.Equals("RetrieveMultiple")) ManyRoles();
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

        }

        private void SingleRole()
        {

        }

        private void ManyConnections()
        {
            tracer.Trace("Checking for entity collection...");
            if (!context.OutputParameters.ContainsKey("BusinessEntityCollection")) return;

            var entities = (EntityCollection)context.OutputParameters["BusinessEntityCollection"];
            foreach(var entity in entities.Entities)
            {
                tracer.Trace("Localizing connection:");
                if(entity.Contains(ROLE_1))
                {
                    var role1 = entity.GetAttributeValue<EntityReference>(ROLE_1);
                    tracer.Trace($"\tRole 1 (before): {role1.Name}");
                    if (labels.Contains(role1.Name)) role1.Name = labels[role1.Name][lcid];
                    entity[ROLE_1] = role1;
                    tracer.Trace($"\tRole 1 (after): {role1.Name}");
                }

                if(entity.Contains(ROLE_2))
                {
                    var role2 = entity.GetAttributeValue<EntityReference>(ROLE_2);
                    tracer.Trace($"\tRole 2 (before): {role2.Name}");
                    if (labels.Contains(role2.Name)) role2.Name = labels[role2.Name][lcid];
                    entity[ROLE_2] = role2;
                    tracer.Trace($"\tRole 2 (after): {role2.Name}");
                }
            }
        }

        private void ManyRoles()
        {

        }

        [Serializable]
        public class Labels
        {
            public List<LabelItem> Items { get; set; }

            public bool Contains(string key)
            {
                return Items.Any(x => x.Key.Equals(key));
            }

            public LabelItem this[string key]
            {
                get
                {
                    return Items.Single(x => x.Key.Equals(key));
                }
            }
        }

        [Serializable]
        public class LabelItem
        {
            public string Key { get; set; }
            public string English { get; set; }
            public string French { get; set; }

            public string this[int lcid]
            {
                get
                {
                    if (lcid == 1036) return French;
                    else return English;
                }
            }
        }
    }
}
