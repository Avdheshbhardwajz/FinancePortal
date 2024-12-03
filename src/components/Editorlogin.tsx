



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


// interface LoginFormData {
//   email: string;
//   password: string;
// }


// const EditorLogin: React.FC = () => {
//     const navigate = useNavigate();
//   const [loginData, setLoginData] = useState<LoginFormData>({
//     email: '',
//     password: '',
//   });

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');
  
//   const VALID_EMAIL = 'Sundaram123@gmail.com';
//   const VALID_PASSWORD = 'Sundaram@123';

//   const MAKER_VALID_EMAIL = 'Sundaram12345@gmail.com';
//   const MAKER_VALID_PASSWORD = 'Sundaram@12345';



//   const ADMIN_VALID_EMAIL = 'Admin123@gmail.com';
//   const ADMIN_VALID_PASSWORD = 'Admin@123';


//   const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setLoginData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError('');
//   };

 

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

  
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     if (loginData.email === VALID_EMAIL && loginData.password === VALID_PASSWORD) {
    
//       localStorage.setItem('makerToken', 'dummy-token-12345');
   
//       navigate('/dashboard');
//     }
//     else if (loginData.email === MAKER_VALID_EMAIL && loginData.password === MAKER_VALID_PASSWORD)
//       {

//         localStorage.setItem('checkerToken', 'dummy-token-12345');

//         navigate('/checker');

//       }
//       else if (loginData.email === ADMIN_VALID_EMAIL && loginData.password === ADMIN_VALID_PASSWORD)
//         {
  
//           localStorage.setItem('adminToken', 'dummy-token-12345');
  
//           navigate('/admin');
  
//         } else {
//       setError('Invalid email or password');
//     }
    
//     setIsLoading(false);
//   };

 

//   return (
//     <Card className="w-full max-w-md font-poppins">
//       <CardHeader className="space-y-1">
//         <CardTitle className="text-2xl font-bold text-center"> Login</CardTitle>
//         <CardDescription className="text-center text-gray-500">
//           Enter your credentials to access the dashboard
//         </CardDescription>
//       </CardHeader>
      
//       <CardContent>
//         <form onSubmit={handleLogin} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           <div className="space-y-4">
//             <div className="space-y-2">
//               <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
//                 Email address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={loginData.email}
//                   onChange={handleLoginChange}
//                   className="pl-10"
//                   placeholder="editor@example.com"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <Input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="current-password"
//                   required
//                   value={loginData.password}
//                   onChange={handleLoginChange}
//                   className="pl-10"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>
//           </div>

//           <Button
//             type="submit"
//             disabled={isLoading}
//             className="w-full"
//           >
//             {isLoading ? (
//               <span className="flex items-center justify-center">
//                 <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                 Signing in...
//               </span>
//             ) : (
//               <span className="flex items-center justify-center">
//                 Sign in
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </span>
//             )}
//           </Button>
//         </form>
//       </CardContent>

     
//     </Card>
//   );
// };

// export default EditorLogin;




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LoginFormData {
  email: string;
  password: string;
  role: string;
}

const EditorLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const VALID_EMAIL = 'Sundaram123@gmail.com';
  const VALID_PASSWORD = 'Sundaram@123';

  const MAKER_VALID_EMAIL = 'Sundaram12345@gmail.com';
  const MAKER_VALID_PASSWORD = 'Sundaram@12345';

  const ADMIN_VALID_EMAIL = 'Admin123@gmail.com';
  const ADMIN_VALID_PASSWORD = 'Admin@123';

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRoleChange = (value: string) => {
    setLoginData(prev => ({
      ...prev,
      role: value
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!loginData.role) {
      setError('Please select a role');
      setIsLoading(false);
      return;
    }

    if (loginData.role === 'maker' && loginData.email === VALID_EMAIL && loginData.password === VALID_PASSWORD) {
      localStorage.setItem('makerToken', 'dummy-token-12345');
      navigate('/dashboard');
    }
    else if (loginData.role === 'checker' && loginData.email === MAKER_VALID_EMAIL && loginData.password === MAKER_VALID_PASSWORD) {
      localStorage.setItem('checkerToken', 'dummy-token-12345');
      navigate('/checker');
    }
    else if (loginData.role === 'admin' && loginData.email === ADMIN_VALID_EMAIL && loginData.password === ADMIN_VALID_PASSWORD) {
      localStorage.setItem('adminToken', 'dummy-token-12345');
      navigate('/admin');
    } else {
      setError('Invalid email or password for selected role');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md font-poppins">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center text-gray-500">
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2 ">
              <label className="text-sm font-medium text-gray-700 block">
                Select Role
              </label>
              <Select value={loginData.role} onValueChange={handleRoleChange} >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className='bg-white font-poppins'>
                  <SelectItem value="maker">Maker</SelectItem>
                  <SelectItem value="checker">Checker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="pl-10"
                  placeholder="editor@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditorLogin;