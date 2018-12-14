using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TcDirectory.Models
{
    public class Client
    {
        public string AbsenceReasonCd { get; set; }
        public string AbsenceTypeCd { get; set; }
        public string AcronymEtxt { get; set; }
        public string AcronymFtxt { get; set; }
        public string CityEtxt { get; set; }
        public string CityFtxt { get; set; }
        public DateTime? DateAbsenceStartDte { get; set; }
        public DateTime? DateAbsenceStopDte { get; set; }
        public DateTime? DateCurrentDte { get; set; }
        public DateTime? DateDepartureDte { get; set; }
        public string DesignatorCd { get; set; }
        public string EmailAddressTxt { get; set; }
        public string EmploymentStatusCd { get; set; }
        public string EmploymentStatusEtxt { get; set; }
        public string EmploymentStatusFtxt { get; set; }
        public string FloorLocationTxt { get; set; }
        public string LanguageCd { get; set; }
        public string MailboxLanguageCd { get; set; }
        public string ManagerPositionId { get; set; }
        public string NameGivenNm { get; set; }
        public string NameInitialsNm { get; set; }
        public string NameNickNm { get; set; }
        public string NameSurnameNm { get; set; }
        public string OfficeBuildingEtxt { get; set; }
        public string OfficeBuildingFtxt { get; set; }
        public int OrganizationId { get; set; }
        public string OrganizationNameEtxt { get; set; }
        public string OrganizationNameFtxt { get; set; }
        public string OrganizationTelnoFaxTxt { get; set; }
        public string OrganizationTelnoVoiceExtTxt { get; set; }
        public string OrganizationTelnoVoiceTxt { get; set; }
        public int ParentOrganizationId { get; set; }
        public string PhysicalLocationTxt { get; set; }
        public string PositionEtxt { get; set; }
        public string PositionFtxt { get; set; }
        public string PositionId { get; set; }
        public string PostalCodeTxt { get; set; }
        public string PrimeLocationInd { get; set; }
        public string ProvinceEtxt { get; set; }
        public string ProvinceFtxt { get; set; }
        public string RegionCd { get; set; }
        public int? ResourceCapacityNbr { get; set; }
        public string ResourceCategoryCd { get; set; }
        public string ResourceDescriptionEtxt { get; set; }
        public string ResourceDescriptionFtxt { get; set; }
        public string SalutationCd { get; set; }
        public string SecondmentInd { get; set; }
        public string ServerNameNm { get; set; }
        public string StreetEtxt { get; set; }
        public string StreetFtxt { get; set; }
        public string TelnoCellTxt { get; set; }
        public string TelnoFaxTxt { get; set; }
        public string TelnoPagerExtTxt { get; set; }
        public string TelnoPagerTxt { get; set; }
        public string TelnoVoiceExtTxt { get; set; }
        public string TelnoVoiceTxt { get; set; }
        public string UserId { get; set; }
        public string UserIdOriginal { get; set; }
    }
}
