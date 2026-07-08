export interface AddressDTO {
  id:         string;
  label:      string | null;
  fullName:   string;
  phone:      string;
  street:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
  isDefault:  boolean;
}
