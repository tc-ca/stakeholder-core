using Microsoft.Xrm.Sdk;
using System;
using System.IO;
using System.Xml.Serialization;

namespace Core.Charts
{
    public class Retrieve : IPlugin
    {
        #region Secure/Unsecure Configuration Setup
        private string _secureConfig = null;
        private string _unsecureConfig = null;

        public Retrieve(string unsecureConfig, string secureConfig)
        {
            _secureConfig = secureConfig;
            _unsecureConfig = unsecureConfig;
        }
        #endregion
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            try
            {
                var entity = (Entity)context.OutputParameters["BusinessEntity"];
                var serializer = new XmlSerializer(typeof(Configuration));
                Configuration config = null;
                using (var reader = new StringReader(_unsecureConfig))
                {
                    config = (Configuration)serializer.Deserialize(reader);
                }

                if (entity.Id != config.Id || !entity.Contains("datadescription")) return;

                var fetch = (string)entity["datadescription"];
                entity["datadescription"] = fetch.Replace(config.OldText, config.NewText);
            }
            catch (Exception e)
            {
                throw new InvalidPluginExecutionException(e.Message);
            }
        }
    }
}
