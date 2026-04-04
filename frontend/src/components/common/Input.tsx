interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const InputField = ({ label, error, ...props }: Props) => (
    <div className="mb-4">
        <label className="block mb-1 font-bold">{label}</label>
        <input 
            {...props} 
            className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded`} 
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
);