import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

interface ChildInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  currentSchool: string;
  yearLevel: string;
  medicalIssues: string; // 'yes' or 'no'
  medicalDetails: string;
}

interface FormData {
  parent1FirstName: string;
  parent1LastName: string;
  parent1Relationship: string;
  parent1Address: string;
  parent1Postcode: string;
  parent1Mobile: string;
  parent1Email: string; // Added email for primary contact
  parent2FirstName: string;
  parent2LastName: string;
  parent2Relationship: string;
  parent2Address: string;
  parent2Postcode: string;
  parent2Mobile: string;
  children: ChildInfo[];
  numberOfChildren: number;
}

interface ApplicationFormProps {
  onSubmitSuccess: (formData: FormData & { children: ChildInfo[]; numberOfChildren: number }) => void;
}

const initialChildState: ChildInfo = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  currentSchool: '',
  yearLevel: '',
  medicalIssues: 'no',
  medicalDetails: '',
};

const FORM_STORAGE_KEY = 'madrasah_application_form';

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmitSuccess }) => {
  // Load saved form data from localStorage
  const loadSavedFormData = (): Omit<FormData, 'children' | 'numberOfChildren'> => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.formData || {
          parent1FirstName: '',
          parent1LastName: '',
          parent1Relationship: '',
          parent1Address: '',
          parent1Postcode: '',
          parent1Mobile: '',
          parent1Email: '',
          parent2FirstName: '',
          parent2LastName: '',
          parent2Relationship: '',
          parent2Address: '',
          parent2Postcode: '',
          parent2Mobile: '',
        };
      }
    } catch (e) {
      console.error('Error loading saved form data:', e);
    }
    return {
      parent1FirstName: '',
      parent1LastName: '',
      parent1Relationship: '',
      parent1Address: '',
      parent1Postcode: '',
      parent1Mobile: '',
      parent1Email: '',
      parent2FirstName: '',
      parent2LastName: '',
      parent2Relationship: '',
      parent2Address: '',
      parent2Postcode: '',
      parent2Mobile: '',
    };
  };

  const loadSavedChildrenData = (): { numberOfChildren: number; childrenData: ChildInfo[] } => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          numberOfChildren: parsed.numberOfChildren || 1,
          childrenData: parsed.childrenData || [initialChildState],
        };
      }
    } catch (e) {
      console.error('Error loading saved children data:', e);
    }
    return {
      numberOfChildren: 1,
      childrenData: [initialChildState],
    };
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const savedChildren = loadSavedChildrenData();
  const [numberOfChildren, setNumberOfChildren] = useState(savedChildren.numberOfChildren);
  const [childrenData, setChildrenData] = useState<ChildInfo[]>(savedChildren.childrenData);
  const [formData, setFormData] = useState<Omit<FormData, 'children' | 'numberOfChildren'>>(loadSavedFormData());

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({
        formData,
        numberOfChildren,
        childrenData,
      }));
    } catch (e) {
      console.error('Error saving form data:', e);
    }
  }, [formData, numberOfChildren, childrenData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChildInputChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newChildrenData = [...childrenData];
    newChildrenData[index] = { ...newChildrenData[index], [name]: value };
    setChildrenData(newChildrenData);
  };

  const handleNumberOfChildrenChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setNumberOfChildren(count);
    const newChildren: ChildInfo[] = [];
    for (let i = 0; i < count; i++) {
      newChildren.push(childrenData[i] || { ...initialChildState });
    }
    setChildrenData(newChildren);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
    const fullFormData = {
      ...formData,
      numberOfChildren,
      children: JSON.stringify(childrenData, null, 2),
        access_key: '0d1a51cf-4e51-4254-adcf-0cd9af908071',
        subject: 'New School Application Submission',
        from_name: `${formData.parent1FirstName} ${formData.parent1LastName}`,
        to_email: formData.parent1Email,
    };

    console.log('[ApplicationForm] Attempting submission...');
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSubmitSuccess(true);
        console.log('[ApplicationForm] Web3Forms submission successful. Calling onSubmitSuccess.');
        // Don't clear localStorage yet - keep it until payment is successful
        // This allows users to go back and edit if needed
        onSubmitSuccess({
          ...formData,
          children: childrenData,
          numberOfChildren,
        });
      } else {
        throw new Error(result.message || 'Form submission failed');
    }
    } catch (error) {
      console.error('[ApplicationForm] Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChildForms = () => {
    return childrenData.map((child, index) => (
      <div key={index} className="p-4 border border-neutral-border rounded-lg mt-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Child {index + 1} Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`child${index}_firstName`} className="block text-sm font-medium text-gray-700 mb-1">First Name (Required)</label>
            <input type="text" name="firstName" id={`child${index}_firstName`} value={child.firstName} onChange={(e) => handleChildInputChange(index, e)} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor={`child${index}_lastName`} className="block text-sm font-medium text-gray-700 mb-1">Last Name (Required)</label>
            <input type="text" name="lastName" id={`child${index}_lastName`} value={child.lastName} onChange={(e) => handleChildInputChange(index, e)} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor={`child${index}_dob`} className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Required)</label>
            <input type="date" name="dob" id={`child${index}_dob`} value={child.dob} onChange={(e) => handleChildInputChange(index, e)} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor={`child${index}_gender`} className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" id={`child${index}_gender`} value={child.gender} onChange={(e) => handleChildInputChange(index, e)} className="w-full border border-neutral-border rounded px-3 py-2">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label htmlFor={`child${index}_currentSchool`} className="block text-sm font-medium text-gray-700 mb-1">Current School (Required)</label>
            <input type="text" name="currentSchool" id={`child${index}_currentSchool`} value={child.currentSchool} onChange={(e) => handleChildInputChange(index, e)} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor={`child${index}_yearLevel`} className="block text-sm font-medium text-gray-700 mb-1">Year Level (Required)</label>
            <select name="yearLevel" id={`child${index}_yearLevel`} value={child.yearLevel} onChange={(e) => handleChildInputChange(index, e)} required className="w-full border border-neutral-border rounded px-3 py-2 bg-white">
              <option value="" disabled>Select Year Level</option>
              <option value="Prep">Prep</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor={`child${index}_medicalIssues`} className="block text-sm font-medium text-gray-700 mb-1">Does the student have any medical issues, learning difficulties, or other special needs? (Required)</label>
            <select name="medicalIssues" id={`child${index}_medicalIssues`} value={child.medicalIssues} onChange={(e) => handleChildInputChange(index, e)} required className="w-full border border-neutral-border rounded px-3 py-2">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          {child.medicalIssues === 'yes' && (
            <div className="md:col-span-2">
              <label htmlFor={`child${index}_medicalDetails`} className="block text-sm font-medium text-gray-700 mb-1">If yes, please give details (Required)</label>
              <textarea name="medicalDetails" id={`child${index}_medicalDetails`} value={child.medicalDetails} onChange={(e) => handleChildInputChange(index, e)} required={child.medicalIssues === 'yes'} rows={3} className="w-full border border-neutral-border rounded px-3 py-2"></textarea>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <div className="p-4 border border-neutral-border rounded-lg">
        <h3 className="text-xl font-semibold text-primary mb-4">Parent/Guardian 1 Details (Required)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="parent1FirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" name="parent1FirstName" id="parent1FirstName" value={formData.parent1FirstName} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
            {submitError && <div className="text-red-500 text-xs">{submitError}</div>}
          </div>
          <div>
            <label htmlFor="parent1LastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" name="parent1LastName" id="parent1LastName" value={formData.parent1LastName} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent1Email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="parent1Email" id="parent1Email" value={formData.parent1Email} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent1Mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input type="tel" name="parent1Mobile" id="parent1Mobile" value={formData.parent1Mobile} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="parent1Address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="parent1Address" id="parent1Address" value={formData.parent1Address} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent1Postcode" className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
            <input type="text" name="parent1Postcode" id="parent1Postcode" value={formData.parent1Postcode} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent1Relationship" className="block text-sm font-medium text-gray-700 mb-1">Relationship to Child/ren</label>
            <input type="text" name="parent1Relationship" id="parent1Relationship" value={formData.parent1Relationship} onChange={handleInputChange} required className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="p-4 border border-neutral-border rounded-lg">
        <h3 className="text-xl font-semibold text-primary mb-4">Parent/Guardian 2 Details (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="parent2FirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" name="parent2FirstName" id="parent2FirstName" value={formData.parent2FirstName} onChange={handleInputChange} className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent2LastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" name="parent2LastName" id="parent2LastName" value={formData.parent2LastName} onChange={handleInputChange} className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent2Mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input type="tel" name="parent2Mobile" id="parent2Mobile" value={formData.parent2Mobile} onChange={handleInputChange} className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
           <div>
            <label htmlFor="parent2Relationship" className="block text-sm font-medium text-gray-700 mb-1">Relationship to Child/ren</label>
            <input type="text" name="parent2Relationship" id="parent2Relationship" value={formData.parent2Relationship} onChange={handleInputChange} className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="parent2Address" className="block text-sm font-medium text-gray-700 mb-1">Address (if different from Parent 1)</label>
            <input type="text" name="parent2Address" id="parent2Address" value={formData.parent2Address} onChange={handleInputChange} className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="parent2Postcode" className="block text-sm font-medium text-gray-700 mb-1">Postcode (if different)</label>
            <input type="text" name="parent2Postcode" id="parent2Postcode" value={formData.parent2Postcode} onChange={handleInputChange} className="w-full border border-neutral-border rounded px-3 py-2" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="numberOfChildren" className="block text-lg font-semibold text-primary mb-2">Number of Children to Register (Required)</label>
        <select id="numberOfChildren" name="numberOfChildren" value={numberOfChildren} onChange={handleNumberOfChildrenChange} required className="w-full md:w-1/3 border border-neutral-border rounded px-3 py-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      {renderChildForms()}

      <div className="mt-8 text-center">
        <button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-10 rounded shadow transition duration-300 inline-flex items-center text-lg">
          {isSubmitting ? 'Submitting Application...' : 'Submit Application & Proceed to Payment'}
          {!isSubmitting && <span className="material-icons ml-2">arrow_forward</span>}
        </button>
        {submitError && <div className="text-red-500 mt-2 block">{submitError}</div>}
      </div>
    </form>
  );
};

export default ApplicationForm; 