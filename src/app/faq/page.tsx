import FAQ from '@/app/components/FAQ'; 

export default function FAQPage() {
    const carwowFAQs = [
      {
        question: "What is Carsawa?",
        answer: "Carsawa is an online platform for buying a new car or selling your old one! We bring you great offers from thousands of trusted partners so you can buy or sell your car in just a few clicks. No haggling and no fees."
      },
      {
        question: "How does Carsawa work?",
        answer: "Our platform connects you with trusted dealerships across the country. Simply input your car preferences or details about the car you're selling, and we'll match you with the best offers. You can compare prices, read reviews, and make your decision without any pressure."
      },
      {
        question: "Does it cost me anything to use Carsawa?",
        answer: "No, Carsawa is completely free for users! We make our money through our partnerships with car dealerships, so you can enjoy our service without any fees or hidden costs."
      },
      {
        question: "How can I sell my car through Carsawa?",
        answer: "To sell your car, simply go to the 'Sell' section of our platform and provide details about your car, such as make, model, year, mileage, and condition."
      },
      {
        question: "Are there any fees for selling my car on Carsawa?",
        answer: "No, there are no fees for selling your car on Carsawa. Our service is completely free for users.You can sell your car without any hidden costs."
      },
      {
        question: "Can I import a car through Carsawa?",
        answer: "Currently, Carsawa does not offer car import services. We are working with our dealership partners to ensure safety and streamline the process for future offerings. Stay tuned for updates!"
      },
      {
        question: "How do I contact a dealer about a car I'm interested in?",
        answer: "If you're interested in a car listed on Carsawa, you can contact the dealer directly through our platform. Each listing includes the dealer's contact information or 'Inquire Now' button that allows you to send a message. You can ask questions, schedule a test drive, or discuss financing options."
      },
      {
        question: "What kind of support does Carsawa offer?",
        answer: "Carsawa offers customer support to assist you with any questions or issues you may have. You can find our contact information in the 'Help' or 'Support' section of our website."
      }
    ];
  
    return (
      <div className="w-full bg-[#DEDCD9] py-5 px-3 md:py-12 md:px-8">
        <div className="container lg:px-30 mx-auto">
          <FAQ faqItems={carwowFAQs} />
        </div>
      </div>
    );
  }