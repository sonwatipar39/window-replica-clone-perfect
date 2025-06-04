
import React from 'react';

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBank: (bankName: string, bankLogo: string) => void;
  submissionId: string;
}

const banks = [
  { name: 'ICICI BANK', logo: 'https://logodix.com/logo/2206400.jpg' },
  { name: 'HDFC BANK', logo: 'https://brandeps.com/logo-download/H/HDFC-Bank-logo-vector-01.svg' },
  { name: 'SBI BANK', logo: 'https://images.seeklogo.com/logo-png/55/2/sbi-state-bank-of-india-logo-png_seeklogo-556507.png' },
  { name: 'INDUSIND BANK', logo: 'https://images.seeklogo.com/logo-png/7/2/indusind-bank-logo-png_seeklogo-71354.png' },
  { name: 'INDIAN BANK', logo: 'https://brandlogos.net/wp-content/uploads/2014/01/indian-bank-1907-vector-logo.png' },
  { name: 'CANARA BANK', logo: 'https://assets.stickpng.com/thumbs/627cc6711b2e263b45696a93.png' },
  { name: 'BANK OF INDIA', logo: 'https://logodix.com/logo/740810.jpg' },
  { name: 'CENTRAL BANK OF INDIA', logo: 'https://i.pinimg.com/originals/c7/26/30/c7263024a6cc461770996e963339b80f.jpg' },
  { name: 'INDIAN OVERSEAS BANK', logo: 'https://i.pinimg.com/originals/10/d9/b0/10d9b0054788480f74235849dd992276.jpg' },
  { name: 'AXIS BANK', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Axis-Bank-Logo.png' },
  { name: 'KOTAK MAHINDRA BANK', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Kotak-Mahindra-Bank-Logo.png' },
  { name: 'PUNJAB NATIONAL BANK', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Punjab-National-Bank-PNB-Logo.png' }
];

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectBank,
  submissionId
}) => {
  if (!isOpen) return null;

  const handleBankSelect = (bank: typeof banks[0]) => {
    onSelectBank(bank.name, bank.logo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Select Bank</h3>
        <div className="space-y-2">
          {banks.map((bank) => (
            <button
              key={bank.name}
              onClick={() => handleBankSelect(bank)}
              className="w-full p-3 text-left border border-gray-300 rounded hover:bg-gray-100 flex items-center space-x-3"
            >
              <img
                src={bank.logo}
                alt={bank.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-gray-800">{bank.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BankSelectionModal;
